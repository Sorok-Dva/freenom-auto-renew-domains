ARG APT_FLAGS="-y -qq --no-install-recommends --no-install-suggests"

FROM node:16-bullseye-slim AS base

# We don't need the standalone Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

ARG APT_FLAGS
ARG COMMON_PACKAGES="\
  curl \
  gnupg \
  ca-certificates \
  make \
"

RUN mkdir -p /usr/share/man/man1

# Install Google Chrome Stable and fonts
# Note: this installs the necessary libs to make the browser work with Puppeteer.
RUN apt-get update && apt-get install  ${APT_FLAGS} ${COMMON_PACKAGES} -y \
  && curl --location --silent https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
  && apt-get update \
  && apt-get install -y \
    google-chrome-stable \
    fonts-ipafont-gothic \
    fonts-wqy-zenhei \
    fonts-thai-tlwg \
    fonts-kacst \
    fonts-freefont-ttf \
    libxss1 -y --no-install-recommends \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

RUN ln -s /usr/lib/x86_64-linux-musl/libc.so /lib/libc.musl-x86_64.so.1

FROM base as packages

WORKDIR /build

RUN chown node:node /build

USER node

# Ensure artefacts folders permissions
RUN mkdir dist node_modules

COPY package*.json ./

RUN npm ci --only=production
RUN cp -a node_modules production_modules
RUN npm ci --silent --only=dev

# Dev stage

FROM packages as dev

USER root

ENV NODE_ENV development

USER node

WORKDIR /build

COPY . .

# Build stage

FROM packages as build

COPY --from=dev /build/ .

RUN npm run build

# Final Image

FROM base

ENV NODE_ENV production

USER node

WORKDIR /app

COPY package.json .
COPY --from=build /build/dist dist
COPY --from=packages /build/production_modules node_modules

CMD node dist

