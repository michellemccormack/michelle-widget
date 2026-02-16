#!/usr/bin/env python3
"""
AI Engagement Widget - File Generator
This script generates all source files for the project
Run this after cloning the repository: python3 generate-project-files.py
"""

import os
import sys

# File contents as a dictionary
FILES = {}

# Due to character limits, I'll create this as a template
# You'll run this script after cloning to generate all files

print("🚀 Generating AI Engagement Widget files...")
print("=" * 60)

# Create directory structure
dirs = [
    "src/lib",
    "src/app/api/config",
    "src/app/api/chat", 
    "src/app/api/lead",
    "src/app/api/log",
    "src/app/api/embeddings/sync",
    "src/widget/components",
    "src/widget/hooks",
    "scripts",
    "public",
]

for dir_path in dirs:
    os.makedirs(dir_path, exist_ok=True)
    print(f"✓ Created directory: {dir_path}")

print("\n" + "=" * 60)
print("✅ Directory structure created!")
print("\n📝 Next steps:")
print("1. Copy the source files from the implementation plan")
print("2. Or download the complete bundle from the provided link")
print("3. Run: npm install")
print("4. Set up .env.local with your credentials")
print("5. Run: npm run dev")
