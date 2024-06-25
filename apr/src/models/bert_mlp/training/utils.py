import csv
import numpy as np
import argparse
from datetime import datetime, timedelta

def str_to_bool(value):
    if value.lower() in {"false", "f", "0", "no", "n"}:
        return False
    elif value.lower() in {"true", "t", "1", "yes", "y"}:
        return True
    raise ValueError(f"{value} is not a valid boolean value")


def parse_args():
    ap = argparse.ArgumentParser()
    ap.add_argument("-inp_dir", type=str, default="data/")
    ap.add_argument("-dataset", type=str, default="essays")
    ap.add_argument("-lr", type=float, default=5e-4)
    ap.add_argument("-batch_size", type=int, default=32)
    ap.add_argument("-epochs", type=int, default=10)
    # ap.add_argument("-seed", type=int, default=np.random.randint(0,1000))
    ap.add_argument(
        "-log_expdata", type=str_to_bool, nargs="?", const=True, default=True
    )
    ap.add_argument("-embed", type=str, default="bert-base")
    ap.add_argument("-layer", type=str, default="11")
    ap.add_argument("-mode", type=str, default="512_head")
    ap.add_argument("-embed_mode", type=str, default="cls")
    ap.add_argument("-jobid", type=int, default=0)
    ap.add_argument("-save_model", type=str, default="no")
    args = ap.parse_args()
    return (
        args.inp_dir,
        args.dataset,
        args.lr,
        args.batch_size,
        args.epochs,
        args.log_expdata,
        args.embed,
        args.layer,
        args.mode,
        args.embed_mode,
        args.jobid,
        args.save_model,
    )


def parse_args_extractor():
    ap = argparse.ArgumentParser()
    ap.add_argument("-dataset_type", type=str, default="essays")
    # ap.add_argument("-dataset_type", type=str, default='pandora')  # pandora example
    ap.add_argument("-token_length", type=int, default=512)
    # ap.add_argument("-datafile", type=str, default='data/pandora/')  # pandora example
    ap.add_argument("-batch_size", type=str, default=32)
    ap.add_argument("-embed", type=str, default="bert-base")
    ap.add_argument("-op_dir", type=str, default="data/")
    ap.add_argument("-mode", type=str, default="512_head")
    ap.add_argument("-embed_mode", type=str, default="cls")
    args = ap.parse_args()
    return (
        args.dataset_type,
        args.token_length,
        args.batch_size,
        args.embed,
        args.op_dir,
        args.mode,
        args.embed_mode,
    )