FROM golang:1.26.4-alpine AS build

WORKDIR /src

COPY go.mod go.sum ./
RUN go mod download

COPY src ./src
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /rate-limit ./src

FROM alpine:3.24

RUN addgroup -S app && adduser -S -G app app

COPY --from=build /rate-limit /usr/local/bin/rate-limit

USER app
EXPOSE 8080

ENTRYPOINT ["rate-limit"]
