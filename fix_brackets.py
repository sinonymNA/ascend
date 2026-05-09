path = '/home/user/ascend/client/src/data/apWorldHistory.js'

with open(path, 'r') as f:
    lines = f.readlines()

# Lines to remove (1-indexed): 443, 801, 1159, 1517, 1876
# Convert to 0-indexed: 442, 800, 1158, 1516, 1875
remove_indices = {442, 800, 1158, 1516, 1875}

new_lines = [line for i, line in enumerate(lines) if i not in remove_indices]

with open(path, 'w') as f:
    f.writelines(new_lines)

print(f"Removed {len(remove_indices)} premature closing brackets")
print(f"File now has {len(new_lines)} lines")

# Quick verify the closing brackets
closing = [(i+1, l.rstrip()) for i, l in enumerate(new_lines) if l.rstrip() == '];']
print("Remaining ]; lines:", closing)
