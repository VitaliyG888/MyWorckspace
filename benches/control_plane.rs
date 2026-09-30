use criterion::{black_box, criterion_group, criterion_main, Criterion};
use hexstrike_rust::{tools::web::normalize_urls, core::decision_engine::{Policy, Scope}};
fn benchmarks(c: &mut Criterion) {
    let urls=(0..1000).map(|i|format!("https://example.com/p/{}#fragment",i%100)).collect::<Vec<_>>();
    c.bench_function("normalize_urls_1000",|b|b.iter(||normalize_urls(black_box(&urls)).unwrap()));
    let p=Policy { scope: Scope {domains:["example.com".into()].into(),include_subdomains:true},max_steps:4 };
    c.bench_function("plan_passive_osint",|b|b.iter(||p.plan_osint(black_box("www.example.com")).unwrap()));
}
criterion_group!(benches,benchmarks); criterion_main!(benches);
