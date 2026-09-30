# Bootstrap only: replace mutable tags with reviewed digests for release.
FROM rust:slim AS build
WORKDIR /src
COPY . .
RUN cargo build --release
FROM debian:bookworm-slim
RUN useradd --uid 10001 --create-home hexstrike
COPY --from=build /src/target/release/hexstrike-rust /usr/local/bin/hexstrike-rust
USER 10001:10001
ENTRYPOINT ["/usr/local/bin/hexstrike-rust", "--mcp-stdio"]
