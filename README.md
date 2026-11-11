# Equipment Endpoints

## GET /equipment-types

Returns all equipment types.

### Input

No request body or parameters.

### Output

```json
[
  {
    "id": 1,
    "name": "string",
    "description": "string",
    "created_at": "string"
  }
]
```

Returns an empty array if no equipment types exist.

# Manual Endpoints

## GET /manual/:id

Returns the manual data and all its chunks, ordered by `chunk_index`.

## POST /manual-meta-data

Inserts the manual metadata provided in the request.

### Input

```json
{
  "equipment_type_id": 1,
  "title": "string",
  "manufacturer": "string",
  "version": "1.0",
  "file_path": "string"
}
```

### Output

Returns the ID of the inserted manual if successful.

```json
{
  "manualId": 1
}
```

## POST /manual-chunks

Inserts an array of chunks provided in the `chunks` property.

### Input

```json
{
  "chunks": [
    {
      "manual_id": 1,
      "chunk_index": 0,
      "chunk_text": "string",
      "page_number": 1,
      "section_title": "string"
    },
    {
      "manual_id": 1,
      "chunk_index": 1,
      "chunk_text": "string",
      "page_number": 2,
      "section_title": "string"
    }
  ]
}
```

### Output

Returns the number of inserted chunks.

```json
{
  "inserted": 2
}
```

## GET /manual/:id/search

Returns relevant chunks for the given manual ID and search query.

### Input

```http
GET /manual/1/search?query=sling%20damage&limit=5
```

- `id`: the manual ID.
- `query`: the search text, between 2 and 200 characters.
- `limit`: the maximum number of results, between 1 and 20. Defaults to 5.

### Output

```json
{
  "manual_id": 1,
  "title": "string",
  "query": "sling damage",
  "total_matches": 1,
  "results": [
    {
      "chunk_id": 1,
      "page_number": 1,
      "chunk_index": 0,
      "chunk_text": "string",
      "relevance_score": 0.1
    }
  ]
}
```

`total_matches` counts the returned results after applying the limit.
