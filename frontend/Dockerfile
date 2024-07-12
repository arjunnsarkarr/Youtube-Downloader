FROM node:latest as build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
ENV NEXT_PUBLIC_STANDALONE=true

COPY package.json ./
COPY package-lock.json ./

RUN npm ci --silent
RUN npm install -g --silent
# add app
COPY . /app/



# Build production
RUN npm run build
RUN npm install -g serve

## Start the app on port 3000
CMD serve -s build -l 3000
