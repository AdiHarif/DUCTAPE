
import sys

import pandas as pd
import argparse
import matplotlib.pyplot as plt

# Set up argument parser
parser = argparse.ArgumentParser(description='Generate a benchmark comparison chart.')
parser.add_argument('-i', '--input_csv', type=str, help='Path to the input CSV file', required=True)
parser.add_argument('-o', '--output_image', type=str, help='Path to save the output image', default='benchmark_chart.png')

# Parse arguments
args = parser.parse_args()

# Load the data from the CSV file
data = pd.read_csv(args.input_csv)

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
plt.savefig(args.output_image)
