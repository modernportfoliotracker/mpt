
import os

filepath = 'src/components/DashboardV2.tsx'

with open(filepath, 'r') as f:
    lines = f.readlines()

# Find the Right Column start
right_col_idx = -1
for i, line in enumerate(lines):
    if '/* RIGHT COLUMN: Sidebar' in line:
        right_col_idx = i
        break

if right_col_idx == -1:
    print("Could not find Right Column")
    exit(1)

# Find where Assets Body ends (scanning backwards from Right Column)
# Looking for the closing of the assets body div
# It should be after the last SortableContext or div
# We know lines 1430-1435 roughly contained closing tags.

# Let's just rewriting the layout structure around the cut point.
# We expect lines BEFORE right_col_idx to close:
# 1. Assets Body
# 2. Glass Panel
# 3. Left Column

# The lines immediately proceeding right_col_idx should be </div>'s
# Let's inspect them
print("Lines before Right Column:")
for j in range(right_col_idx - 5, right_col_idx):
    print(f"{j}: {lines[j].rstrip()}")

# We want to force the structure:
# ... content of assets body ...
# </div> (End Assets Body)
# </div> (End Glass Panel)
# </div> (End Left Column)

# We will cut off the file at a safe point inside Assets Body closing
# and then inject the correct closing sequence.

# Look for `)}` which closes the conditional rendering of assets
safe_cut_idx = -1
for j in range(right_col_idx - 10, right_col_idx):
    if ')}' in lines[j]:
        safe_cut_idx = j
        break

if safe_cut_idx != -1:
    # We found `)}`. The next line should be closing Assets Body div.
    # We will rewrite from safe_cut_idx + 1
    
    new_lines = lines[:safe_cut_idx+1] # Include ')}'
    
    # Add closing tags
    new_lines.append("                                </div>\n") # Close Assets Body inner (grid or list)
    # Wait, ')}' closes the ternary logic block?
    # Lines 1424: </div> (grid close)
    # 1425: )}
    # 1426: </div> (Assets Body close)
    
    # Let's assume the ')}' matches the end of the Conditional block.
    # The container 'div style={{ minHeight: 400px }}' needs to close.
    new_lines.append("                        </div>\n") # Close Assets Body
    new_lines.append("                    </div>\n")     # Close Glass Panel
    new_lines.append("                </div>\n")         # Close Left Column
    
    new_lines.append("\n")
    # Add Right Column
    new_lines.append("                {/* RIGHT COLUMN: Sidebar (Summary) - Fixed Width */}\n")
    new_lines.append("                <div style={{ width: '380px', flexShrink: 0, position: 'sticky', top: '1rem' }}>\n")
    new_lines.append("                    {assets.length > 0 && (\n")
    new_lines.append("                        <PortfolioSummary assets={assets} totalValueEUR={totalValueEUR} isBlurred={isBlurred} />\n")
    new_lines.append("                    )}\n")
    new_lines.append("                </div>\n") # Close Right Column
    
    new_lines.append("            </div>\n") # Close Flex Container
    new_lines.append("        </div>\n")     # Close Dnd Wrapper
    new_lines.append("    );\n")
    new_lines.append("}\n")
    
    with open(filepath, 'w') as f:
        f.writelines(new_lines)
    print("Fixed file structure.")
else:
    print("Could not find safe cut point ')}'")
