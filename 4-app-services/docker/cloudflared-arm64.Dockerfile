FROM arm64v8/alpine

ADD https://github.com/cloudflare/cloudflared/releases/download/2022.3.1/cloudflared-linux-arm64 /usr/local/bin/cloudflared

RUN chmod +x /usr/local/bin/cloudflared

RUN cloudflared version

ENTRYPOINT [ "cloudflared", "--no-autoupdate" ]
CMD [ "version" ]
