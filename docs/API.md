# Wikipedia Integration

## Endpoint and request shape

`GET https://en.wikipedia.org/w/api.php` — MediaWiki Action API. Parameters are built with `URLSearchParams` in `src/services/wikipedia.ts`.

```text
action=query
generator=random
grnnamespace=0
grnlimit=1
prop=extracts|info
explaintext=1
exintro=1
inprop=url
format=json
formatversion=2
origin=*
```

`origin=*` is the documented MediaWiki CORS mechanism for unauthenticated browser requests. Requests omit cookies (`credentials: 'omit'`). The browser controls its `User-Agent`; browsers do not allow JavaScript to set an arbitrary `User-Agent` header. To avoid unexpected preflights, this project intentionally does not add a custom identification header. Respect Wikipedia API etiquette: request one page at a time, cache one follow-on passage, avoid polling and repeated loops.

## Example response structure

```json
{
  "query": {
    "pages": [{
      "pageid": 12345,
      "ns": 0,
      "title": "Example article",
      "extract": "An introductory paragraph about an example article...",
      "fullurl": "https://en.wikipedia.org/wiki/Example_article"
    }]
  }
}
```

The parser accepts only one page in namespace 0, a positive integer page ID, a nonempty title, and a usable extract. The optional full URL must use `https://en.wikipedia.org`; otherwise `https://en.wikipedia.org/?curid=PAGEID` is constructed from the validated page ID. No arbitrary API-provided URL is embedded into the UI.

## Processing and provenance

Paragraphs are NFC-normalized, whitespace is collapsed, simple numeric citation markers are removed, and sentence segmentation selects a readable excerpt. `Intl.Segmenter` prevents many common abbreviation/decimal splitting mistakes; a tested, abbreviation-masking fallback covers older browsers. Article material is **never fabricated**: the passage object carries a `source`, title, page ID, URL, license, and shortened flag. Multiple articles in a single timed exercise are counted as multiple sources. Offline samples have no Wikipedia link and explicitly use `source: offline`.

## Error handling

Per-attempt timeout: **4.5 seconds**. Unsuitable, missing, duplicated, invalid or malformed pages are retried within a **three-attempt limit**. Network and API response errors yield modest incremental backoffs; HTTP 429 stops retries immediately (up to 1.3 seconds). Explicit abort cancels the request, and outdated sequence identifiers suppress stale resolutions. Exhausted attempts produce original, public-domain offline text rather than a fake Wikipedia excerpt. Network errors and rate limits are not bypassed through proxies; the visitor can retry manually.

## Wikimedia attribution

Wikipedia text is generally [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) and may have older GFDL provisions. The interface shows title, Wikipedia source, license link, shortened indication and a direct original article link for article edit history/authorship. When redistributing modified excerpts outside this app, follow attribution and share-alike requirements. MIT applies only to WikiType code. Original offline text has CC0 dedication.

References: [MediaWiki Action API](https://www.mediawiki.org/wiki/API:Action_API), [Cross-site requests](https://www.mediawiki.org/wiki/API:Cross-site_requests), [Wikimedia API etiquette](https://www.mediawiki.org/wiki/API:Etiquette).
