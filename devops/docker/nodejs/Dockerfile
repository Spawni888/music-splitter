FROM nikolaik/python-nodejs:python3.8-nodejs14

WORKDIR /usr/src/app

COPY package.json .
COPY yarn.lock .

RUN yarn install
COPY . /usr/src/app
RUN yarn build

RUN apt-get update
RUN apt-get install -y libsndfile-dev
RUN apt-get install -y ffmpeg

RUN pip3 install --upgrade pip
RUN pip install spleeter
#RUN service ssh start
#RUN eval $(ssh-agent -s)
#RUN ssh-add ~/.ssh/id_splitter

CMD ["yarn", "prod"]
