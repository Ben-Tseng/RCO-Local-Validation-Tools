# RCO-Local-Validation-Tools
Passport MRZ, HK ID, TW ID and Chinese ID verification assisted tool

Overview

Due to strict data security and compliance requirements, all internal development and verification tools in our company must not exchange any data with external systems or third‑party services.

This repository contains a set of purely client‑side, offline-capable validation tools designed to assist internal operations  without transmitting any personal data outside the user’s local environment.

All logic runs entirely in the browser (HTML + JavaScript). No APIs, no network requests, and no data persistence are involved.

Key Features
1. Passport MRZ (Machine Readable Zone) Validation

Supports ICAO‑compliant passport MRZ formats

Validates:

Document number format

Check digits using standard MRZ weighting rules

Detects invalid or malformed MRZ strings

Designed for manual verification assistance

2. Hong Kong Identity Card (HKID) Validation

Validates HKID structure

Calculates and verifies the check digit using official weighting rules

Supports common HKID formats used in operational workflows

3. Taiwan National Identification Number Validation

Verifies:

Alphabetic area code

Gender digit

Checksum calculation

Fully aligned with Taiwan ID validation standards

4. China Mainland ID — Date Consistency Validation

Extracts Date of Birth from Mainland China ID numbers

Compares DOB against document issue date

Detects logical inconsistencies (e.g. issue date earlier than DOB)

Intended as a rule‑based sanity check rather than identity confirmation
