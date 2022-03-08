FROM node:12.16.3-stretch
COPY package.json .
RUN yarn install --dev
COPY . .
CMD yarn start

# FROM nginx
# COPY ./build /usr/share/nginx/html
# RUN yarn
