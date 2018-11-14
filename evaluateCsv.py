import subprocess as sp
import os, os.path, sys

def evaluate(csv,w):
    if os.path.isfile(csv) & csv.endswith('.csv'):
        output = sp.check_output(['./a.out', csv, w])
        state_predicted = output.strip().split('\n')[-1]
        print (state_predicted)

if __name__ == '__main__':
    if len(sys.argv) == 3:
        evaluate(sys.argv[1], sys.argv[2])