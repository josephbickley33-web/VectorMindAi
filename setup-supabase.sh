#!/bin/bash

# VectorMind AI - Supabase Setup Script
# This script will help you set up Supabase and turn off local mode

echo "=================================="
echo "VectorMind AI - Supabase Setup"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env.local exists
if [ ! -f "frontend/.env.local" ]; then
    echo -e "${YELLOW}⚠️  Warning: frontend/.env.local not found${NC}"
    exit 1
fi

# Extract Supabase URL
SUPABASE_URL=$(grep NEXT_PUBLIC_SUPABASE_URL frontend/.env.local | cut -d '=' -f2)
SUPABASE_PROJECT_ID=$(echo $SUPABASE_URL | sed 's/https:\/\/\(.*\)\.supabase\.co/\1/')

echo -e "${BLUE}📊 Your Supabase Project:${NC}"
echo "  URL: $SUPABASE_URL"
echo "  Project ID: $SUPABASE_PROJECT_ID"
echo ""

echo -e "${GREEN}✅ Step 1: Copy the schema to your clipboard${NC}"
echo "  The schema is in: supabase-schema.sql"
echo ""

echo -e "${GREEN}✅ Step 2: Open Supabase Dashboard${NC}"
echo "  Dashboard: https://supabase.com/dashboard/project/$SUPABASE_PROJECT_ID"
echo "  SQL Editor: https://supabase.com/dashboard/project/$SUPABASE_PROJECT_ID/sql/new"
echo ""

echo -e "${GREEN}✅ Step 3: Run the schema${NC}"
echo "  1. Click 'New Query' in SQL Editor"
echo "  2. Paste the schema from supabase-schema.sql"
echo "  3. Click 'Run' (or Ctrl/Cmd + Enter)"
echo ""

echo -e "${GREEN}✅ Step 4: Verify tables created${NC}"
echo "  Tables: https://supabase.com/dashboard/project/$SUPABASE_PROJECT_ID/editor"
echo "  Expected tables:"
echo "    - conversations"
echo "    - messages"
echo "    - plans"
echo "    - user_plans"
echo ""

echo -e "${YELLOW}📋 Quick Copy Schema:${NC}"
echo "Run this command to copy schema to clipboard (Linux):"
echo "  cat supabase-schema.sql | xclip -selection clipboard"
echo ""
echo "Or manually copy from: $(pwd)/supabase-schema.sql"
echo ""

# Offer to open browser
read -p "Open Supabase SQL Editor in browser? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Opening browser..."
    $BROWSER "https://supabase.com/dashboard/project/$SUPABASE_PROJECT_ID/sql/new"
fi

echo ""
echo -e "${GREEN}✅ Setup complete! Follow the steps above.${NC}"
echo ""
echo "After running the schema, test by:"
echo "  1. Login at http://localhost:3000/console"
echo "  2. Send a message"
echo "  3. Check Supabase Table Editor to see your message"
echo ""
echo "For detailed help, see: SUPABASE_SETUP_COMPLETE.md"
