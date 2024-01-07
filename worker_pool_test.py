import multiprocessing


def func(a,b):
    return a+10


pool = multiprocessing.Pool()
inputs = [(1,2),(2,2),(3,2),(4,2),(5,2),(6,2)]
print(pool.starmap(func,inputs))
