
import sys

import pandas as pd
import argparse
import matplotlib.pyplot as plt

# Set up argument parser
parser = argparse.ArgumentParser(description='Generate a benchmark comparison chart.')
parser.add_argument('-i', '--input_csv', type=str, help='Path to the input CSV file', required=True)
parser.add_argument('-o', '--output_image', type=str, help='Path to save the output image')
parser.add_argument('--prev', type=str, help='Path to the previous benchmark CSV file')
parser.add_argument('--show', action='store_true', help='Show the generated chart')

# Parse arguments
args = parser.parse_args()

# Load the data from the CSV file
data = pd.read_csv(args.input_csv)

# Check data of previous run
if args.prev:
    prev_data = pd.read_csv(args.prev)
    if len(data) != len(prev_data):
        print('Warning: The number of benchmarks in the current and previous CSV files do not match.')
        args.prev = False

# Assuming the CSV has columns File, Benchmark, Node (JIT-less), Node, DUCTAPE, and Handcrafted Native
benchmarks = data['Benchmark']
jitlessTimes = data['Node (JIT-less)']
jsTimes = data['Node']
ductapeTimes = data['DUCTAPE']
nativeTimes = data['Handcrafted Native']

# Create the column chart
plt.figure(figsize=(10, 6))
bar_width = 0.2
index = range(len(benchmarks))

# Plot current benchmark times
plt.bar(index, jitlessTimes, bar_width, label='Node (JIT-less)', edgecolor='black')
plt.bar([i + bar_width for i in index], jsTimes, bar_width, label='Node', edgecolor='black')
plt.bar([i + 2 * bar_width for i in index], ductapeTimes, bar_width, label='DUCTAPE', edgecolor='black')
plt.bar([i + 3 * bar_width for i in index], nativeTimes, bar_width, label='Handcrafted Native', edgecolor='black')

plt.xlabel('Benchmark')
plt.ylabel('Time (s)')
plt.title('JS Time vs Native Time for Ostrich benchmarks')
xticks_offset = bar_width * (1.5 if args.prev else 0.5)
plt.xticks([i + xticks_offset for i in index], benchmarks, rotation=45, ha='right')
plt.legend()
plt.tight_layout()

# Save the plot as an image file
if args.output_image:
    plt.savefig(args.output_image)

# Show the plot if the --show flag is set
if args.show:
    plt.show()
