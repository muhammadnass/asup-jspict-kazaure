import os, re

base = "/home/muhammad-sanusi/Documents/Projects/ASUP website/asup-jigawa"

# All replacements to make
replacements = [
    ("ASUP Jigawa ICT Kazaure", "ASUP JSPICT Kazaure Chapter"),
    ("ASUP Jigawa ICT", "ASUP JSPICT Kazaure"),
    ("ASUP Jigawa", "ASUP JSPICT Kazaure"),
    ("Jigawa ICT Kazaure", "JSPICT Kazaure"),
    ("ASUP JSPICT Kazaure Chapter Staff Portal", "ASUP JSPICT Kazaure — Staff Portal"),
    ("ASUP JSPICT Kazaure Chapter — Staff Portal", "ASUP JSPICT Kazaure — Staff Portal"),
    # Navbar subtitle
    ("Jigawa ICT Kazaure", "JSPICT Kazaure"),
]

# Files to update
target_extensions = [".tsx", ".ts", ".css"]

updated_files = []

for root, dirs, files in os.walk(base):
    # Skip node_modules and .next
    dirs[:] = [d for d in dirs if d not in ["node_modules", ".next", ".git"]]
    for fname in files:
        if any(fname.endswith(ext) for ext in target_extensions):
            fpath = os.path.join(root, fname)
            try:
                with open(fpath, "r") as f:
                    content = f.read()
                original = content
                for old, new in replacements:
                    content = content.replace(old, new)
                if content != original:
                    with open(fpath, "w") as f:
                        f.write(content)
                    updated_files.append(os.path.relpath(fpath, base))
            except Exception as e:
                print(f"  Skipped {fname}: {e}")

print(f"✅ Updated {len(updated_files)} files:")
for f in updated_files:
    print(f"   - {f}")

# Also fix the Navbar specifically for the logo text
navbar_path = f"{base}/components/Navbar.tsx"
with open(navbar_path, "r") as f:
    content = f.read()

# Fix the two-line logo in Navbar
content = content.replace(
    '<div style={{ color: "white", fontWeight: "bold", fontSize: "13px" }}>ASUP</div>\n              <div style={{ color: "#9ca3af", fontSize: "10px" }}>JSPICT Kazaure</div>',
    '<div style={{ color: "white", fontWeight: "bold", fontSize: "13px" }}>ASUP JSPICT</div>\n              <div style={{ color: "#9ca3af", fontSize: "10px" }}>Kazaure Chapter</div>'
)

# Fix metadata title in layout
layout_path = f"{base}/app/layout.tsx"
with open(layout_path, "r") as f:
    lc = f.read()
lc = lc.replace(
    'title: "ASUP JSPICT Kazaure Chapter"',
    'title: "ASUP JSPICT Kazaure Chapter — Official Website"'
)
lc = lc.replace(
    'title: "ASUP JSPICT Kazaure"',
    'title: "ASUP JSPICT Kazaure Chapter — Official Website"'
)
with open(layout_path, "w") as f:
    f.write(lc)

with open(navbar_path, "w") as f:
    f.write(content)

print("\n✅ Navbar and layout title updated")
print("\n🎉 Branding fix complete!")
print("\nFull name: Jigawa State Polytechnic for Information and Communication Technology, Kazaure")
print("Short name used: JSPICT Kazaure")
print("Chapter name used: ASUP JSPICT Kazaure Chapter")
