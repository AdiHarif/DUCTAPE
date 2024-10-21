
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

# Assuming the CSV has columns 'Benchmark' and 'Score'
benchmarks = data['file']
tsTimes = data['tsTime']
nativeTimes = data['nativeTime']

# Create the column chart
plt.figure(figsize=(10, 6))
full_bar_width = 0.4
bar_width = full_bar_width / 2 if args.prev else full_bar_width
index = range(len(benchmarks))

# Plot current benchmark times
current_offset = full_bar_width - bar_width
plt.bar([i + current_offset for i in index], tsTimes, bar_width, label='Current TS Time', color='skyblue', edgecolor='black')
plt.bar([i + full_bar_width + current_offset for i in index], nativeTimes, bar_width, label='Current Native Time', color='orange', edgecolor='black')

# If previous benchmark file is provided, plot previous benchmark times
if args.prev:
    prev_data = pd.read_csv(args.prev)
    prev_tsTimes = prev_data['tsTime']
    prev_nativeTimes = prev_data['nativeTime']

    plt.rcParams['hatch.linewidth'] = 0.3
    plt.bar(index, prev_tsTimes, bar_width, label='Previous TS Time', color='skyblue', edgecolor='black', hatch='//')
    plt.bar([i + full_bar_width for i in index], prev_nativeTimes, bar_width, label='Previous Native Time', color='orange', edgecolor='black', hatch='//')

plt.xlabel('Benchmark')
plt.ylabel('Time (s)')
plt.title('TS Time vs Native Time for Benchmarks')
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
