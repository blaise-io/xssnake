import shutil
from glob import glob
from os.path import basename, dirname, exists, splitext

for file in (glob("client/*.js") + glob("client/**/*.js") +
             glob("server/*.js") + glob("server/**/*.js") +
             glob("shared/*.js") + glob("shared/**/*.js")):

    name = basename(file)
    name, ext = splitext(name)

    name = ''.join(word.title() if index else word for index, word in enumerate(name.split('_')))

    new_file = f"{dirname(file)}/{name}.ts"

    if not exists(new_file):
        shutil.copy2(file, new_file)
