import { supabase } from "./supabase";

export interface ChatMessage {
  id?: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string;
  tokens_used?: number;
  ai_provider?: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

/**
 * Check if Supabase is available and tables exist
 */
let supabaseAvailable: boolean | null = null;

async function checkSupabase(): Promise<boolean> {
  if (supabaseAvailable !== null) return supabaseAvailable;
  
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data: _, error } = await supabase.from("conversations").select("id").limit(1);
    supabaseAvailable = !error || (error.code !== 'PGRST116' && error.code !== '42P01');
    console.log('Supabase available:', supabaseAvailable);
    return supabaseAvailable;
  } catch {
    supabaseAvailable = false;
    return false;
  }
}

/**
 * Save a message to a conversation (Supabase + localStorage fallback)
 */
export async function saveMessage(
  conversationId: string,
  message: ChatMessage
): Promise<ChatMessage | null> {
  const msgWithTimestamp = { ...message, id: `msg-${Date.now()}`, timestamp: new Date().toISOString() };
  
  // Always save to localStorage first for instant persistence
  try {
    const stored = localStorage.getItem(`conv_${conversationId}_messages`) || '[]';
    const messages = JSON.parse(stored);
    messages.push(msgWithTimestamp);
    localStorage.setItem(`conv_${conversationId}_messages`, JSON.stringify(messages));
  } catch (e) {
    console.warn('localStorage save failed:', e);
  }
  
  // Skip Supabase if using local/emergency ID
  if (conversationId.startsWith('local-') || conversationId.startsWith('emergency-')) {
    console.log("Local mode - message saved to localStorage only");
    return msgWithTimestamp;
  }
  
  // Check if Supabase is available
  const isAvailable = await checkSupabase();
  if (!isAvailable) {
    console.warn("Supabase not available, using localStorage only");
    return msgWithTimestamp;
  }
  
  try {
    const { data, error } = await supabase
      .from("messages")
      .insert([
        {
          conversation_id: conversationId,
          role: message.role,
          content: message.content,
          ai_provider: message.ai_provider,
          tokens_used: message.tokens_used,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error saving message to Supabase:", error);
      return msgWithTimestamp; // Fallback to localStorage version
    }

    return data;
  } catch (error) {
    console.error("Error saving message to Supabase:", error);
    return msgWithTimestamp; // Fallback to localStorage version
  }
}

/**
 * Get all messages in a conversation
 */
export async function getConversationMessages(
  conversationId: string
): Promise<ChatMessage[]> {
  try {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
}

/**
 * Create a new conversation (Supabase + localStorage fallback)
 */
export async function createConversation(
  userId: string,
  title: string = "New Conversation"
): Promise<string | null> {
  // Check if Supabase is available
  const isAvailable = await checkSupabase();
  
  if (!isAvailable) {
    // Create local-only conversation
    const tempId = `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    console.warn("Supabase not available, using localStorage with ID:", tempId);
    
    try {
      const convData = { id: tempId, user_id: userId, title, created_at: new Date().toISOString() };
      localStorage.setItem(`conv_${tempId}`, JSON.stringify(convData));
      localStorage.setItem(`conv_${tempId}_messages`, JSON.stringify([]));
    } catch (e) {
      console.error("localStorage failed:", e);
    }
    
    return tempId;
  }
  
  try {
    const { data, error } = await supabase
      .from("conversations")
      .insert([
        {
          user_id: userId,
          title,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating conversation in Supabase:", error);
      
      // Return a temporary local ID as fallback
      const tempId = `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      console.warn("Using temporary conversation ID:", tempId);
      return tempId;
    }

    return data.id;
  } catch (error) {
    console.error("Error creating conversation:", error);
    
    // Emergency fallback
    const emergencyId = `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return emergencyId;
  }
}

/**
 * Get all conversations for a user
 */
export async function getUserConversations(
  userId: string
): Promise<Conversation[]> {
  try {
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching conversations:", error);
      return [];
    }

    // Fetch messages for each conversation
    const conversationsWithMessages = await Promise.all(
      (data || []).map(async (conv) => {
        const messages = await getConversationMessages(conv.id);
        return {
          ...conv,
          messages,
        };
      })
    );

    return conversationsWithMessages;
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return [];
  }
}

/**
 * Update conversation title
 */
export async function updateConversationTitle(
  conversationId: string,
  title: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("conversations")
      .update({ title, updated_at: new Date().toISOString() })
      .eq("id", conversationId);

    if (error) {
      console.error("Error updating conversation:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error updating conversation:", error);
    return false;
  }
}

/**
 * Delete a conversation and all its messages
 */
export async function deleteConversation(
  conversationId: string
): Promise<boolean> {
  try {
    // Delete messages first
    await supabase
      .from("messages")
      .delete()
      .eq("conversation_id", conversationId);

    // Then delete the conversation
    const { error } = await supabase
      .from("conversations")
      .delete()
      .eq("id", conversationId);

    if (error) {
      console.error("Error deleting conversation:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return false;
  }
}

/**
 * Get context from recent messages for AI (memory)
 */
export function buildContextFromHistory(
  messages: ChatMessage[],
  maxMessages: number = 5
): string {
  // Get last N messages (excluding system messages)
  const recentMessages = messages
    .filter((m) => m.role !== "system")
    .slice(-maxMessages);

  if (recentMessages.length === 0) {
    return "";
  }

  return recentMessages
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n\n");
}

/**
 * Export conversation to JSON file
 */
export function exportConversation(conversation: Conversation): void {
  const dataStr = JSON.stringify(conversation, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `conversation-${conversation.title.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  
  URL.revokeObjectURL(url);
}

/**
 * Export all conversations to JSON file
 */
export function exportAllConversations(conversations: Conversation[]): void {
  const dataStr = JSON.stringify(conversations, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `vectormind-conversations-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  
  URL.revokeObjectURL(url);
}

/**
 * Export conversation to Markdown
 */
export function exportConversationToMarkdown(conversation: Conversation): void {
  let markdown = `# ${conversation.title}\n\n`;
  markdown += `Created: ${new Date(conversation.created_at).toLocaleString()}\n\n`;
  markdown += `---\n\n`;
  
  conversation.messages.forEach((msg, idx) => {
    const role = msg.role === 'user' ? '🧑 User' : '🤖 Assistant';
    markdown += `## Message ${idx + 1} - ${role}\n\n`;
    markdown += `${msg.content}\n\n`;
    if (msg.ai_provider) {
      markdown += `*Provider: ${msg.ai_provider}*\n\n`;
    }
    markdown += `---\n\n`;
  });
  
  const dataBlob = new Blob([markdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `conversation-${conversation.title.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.md`;
  link.click();
  
  URL.revokeObjectURL(url);
}

/**
 * Search conversations by content or title
 */
export function searchConversations(conversations: Conversation[], query: string): Conversation[] {
  const lowerQuery = query.toLowerCase();
  
  return conversations.filter(conv => {
    // Search in title
    if (conv.title.toLowerCase().includes(lowerQuery)) {
      return true;
    }
    
    // Search in message content
    return conv.messages.some(msg => 
      msg.content.toLowerCase().includes(lowerQuery)
    );
  });
}
