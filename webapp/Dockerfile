FROM node:22

COPY . /app
WORKDIR /app

#Install the dependencies
# RUN npm install (originalmente estaba asi)
RUN npm install --omit=dev

ARG API_URI="http://localhost:8000"
ARG LLM_API_KEY
ARG USER_SERVICE_URI=""
ARG BASE_URI=""
ENV REACT_APP_API_ENDPOINT=$API_URI
ENV REACT_APP_LLM_API_KEY=$LLM_API_KEY
ENV REACT_APP_USER_SERVICE_ENDPOINT=$USER_SERVICE_URI
ENV CORS_ORIGIN=$BASE_URI

#Create an optimized version of the webapp
RUN npm run build
# RUN npm install serve (originalmente estaba asi)
RUN npm install -g serve --production

#Execute npm run prod to run the server
CMD [ "npm", "run", "prod" ]
#CMD ["npm", "start"]