
import pandas as pd
from matplotlib import pyplot as plt
import subprocess as sp
import os,sys, os.path

def ToImage(csv):
    if os.path.isfile(csv) & csv.endswith('.csv'):
        df = pd.read_csv(csv, comment='#')
        plt.close()
        plt.scatter(df.length, df.weight) #, marker='.')
        #plt.title((csv.rsplit('/')[0]).replace('.csv', '').replace('_', ''))
        #plt.title((csv.rsplit('/', 1)[1]).replace('.csv', '').replace('_', ' '))
        plt.savefig(csv.replace('.csv', '.png'))

if __name__ == '__main__':
    if len(sys.argv) ==  2:
        ToImage(sys.argv[1])