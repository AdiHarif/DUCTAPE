
import sys

import pandas as pd
import matplotlib.pyplot as plt

if len(sys.argv) != 3:
    print('Usage: python3 benchmarks.py <input_csv> <output_image>')
    sys.exit(1)

# Load the data from the CSV file
data = pd.read_csv(sys.argv[1])

# Assuming the CSV has columns 'Benchmark' and 'Score'
benchmarks = data['file']
tsTimes = data['tsTime']
nativeTimes = data['nativeTime']

# Create the column chart
plt.figure(figsize=(10, 6))
bar_width = 0.35
index = range(len(benchmarks))

plt.bar(index, tsTimes, bar_width, label='TS Time', color='skyblue')
plt.bar([i + bar_width for i in index], nativeTimes, bar_width, label='Native Time', color='orange')

plt.xlabel('Benchmark')
plt.ylabel('Time (s)')
plt.title('TS Time vs Native Time for Benchmarks')
plt.xticks([i + bar_width / 2 for i in index], benchmarks, rotation=45, ha='right')
plt.legend()
plt.tight_layout()

# Save the plot as an image file
plt.savefig(sys.argv[2])
