# Cloudflare Deployment Lab Baseline

## Purpose

Provide a deliberately distinct, non-production static-asset version for
reproducing and verifying cross-version asset routing during Cloudflare Worker
deployment transitions.

## Scope

This fixture contains only an inert HTML shell and unique JavaScript and CSS
asset names. It does not contain product behavior, user data, secrets, or
licensed pattern content. It intentionally omits `version.json` so a mixed
request sequence can expose a stale-version asset lookup.

## Owner

AU-CODEX-PRIMARY maintains this fixture as deployment verification evidence.

## Lifecycle

Use only with the isolated `abris-universe-deployment-lab` Worker. Changes to
the production deployment contract or Cloudflare version routing behavior
trigger review. Never route this fixture to the production hostname.
