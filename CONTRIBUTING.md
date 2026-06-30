# Sådan registrerer du en beslutning

Når I har truffet en væsentlig beslutning i projektet, skal den dokumenteres i beslutningsloggen. Det gør du i få trin.

## 1. Opret et issue

Opret et nyt issue i repoet og vælg skabelonen **Beslutning**. Udfyld felterne:

| Felt | Hvad skal der stå |
|---|---|
| **Beslutningstagere** | Hvem traf beslutningen? Skriv navn(e), rolle(r) eller hvilket organ der besluttede. |
| **Kontekst** | Hvorfor blev beslutningen nødvendig? Hvilke problemer eller muligheder lå bag? |
| **Beslutning** | Hvad blev besluttet? Vær præcis og konkret. |
| **Konsekvenser** | Hvad betyder beslutningen fremadrettet? Både positive og negative konsekvenser. |

## 2. Sæt label

Sæt label `Beslutning` på issuet. Det fortæller systemet at dette issue skal ende i beslutningsloggen.

## 3. Luk issuet

Når beslutningen er truffet og I er enige om beskrivelsen, lukkes issuet som **løst** (completed).

## 4. Godkend pull requesten

Der bliver automatisk oprettet en pull request med et udkast til beslutningsloggen. En anden end dig selv — gerne en der ikke var direkte involveret i beslutningen — kigger igennem og godkender.

## 5. Beslutningen er officiel

Når pull requesten er godkendt og merget, står beslutningen i loggen. Herefter kan alle se den under `DECISION_LOG.md`.

## God praksis

- Brug et issue per beslutning — hold emnerne adskilt
- Vær tydelig i beskrivelsen — tænk på at andre skal kunne læse det om et år
- Involér gerne relevante parter i diskussionen før issuet lukkes
- Har du spørgsmål? Opret et issue og spør — eller tag fat i sekretariatet
