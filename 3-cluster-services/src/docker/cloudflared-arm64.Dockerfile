FROM alpine/curl as builder

WORKDIR /work

RUN curl -sLO https://github.com/cloudflare/cloudflared/releases/download/2022.3.4/cloudflared-linux-arm64 && \
    chmod +x cloudflared-linux-arm64

FROM arm64v8/alpine

COPY --from=builder /work/cloudflared-linux-arm64 /usr/local/bin/cloudflared

ENTRYPOINT [ "cloudflared", "--no-autoupdate" ]
CMD [ "version" ]