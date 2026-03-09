---
title: DegradNet API
emoji: 🔍
colorFrom: blue
colorTo: purple
sdk: docker
pinned: false
---

# DegradNet API

Material degradation detection API using deep learning.

## Endpoints

- `GET /` - Health check
- `POST /predict` - Upload an image to get material classification and degradation mask

## Usage

```python
import requests

url = "https://YOUR-SPACE-NAME.hf.space/predict"
files = {"file": open("image.jpg", "rb")}
response = requests.post(url, files=files)
print(response.json())
```
