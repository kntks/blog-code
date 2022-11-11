FROM golang:1.19.3-bullseye as build
RUN git clone https://github.com/hashicorp/http-echo.git
RUN cd http-echo && CGO_ENABLED=0 go build

FROM gcr.io/distroless/static-debian11:debug
COPY --from=build /go/http-echo/http-echo /
ENTRYPOINT [ "/http-echo" ]