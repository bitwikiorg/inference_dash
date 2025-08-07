{
  "nodes": [
    {
      "parameters": {},
      "type": "n8n-nodes-base.manualTrigger",
      "typeVersion": 1,
      "position": [
        -112,
        592
      ],
      "id": "098af5cb-9c75-4bd5-9bac-40db76a6c66c",
      "name": "When clicking ‘Execute workflow’"
    },
    {
      "parameters": {
        "url": "https://api.venice.ai/api/v1/api_keys/rate_limits",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpBearerAuth",
        "options": {}
      },
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [
        112,
        496
      ],
      "id": "df8a27b6-5ea1-4064-ab4d-2adcced7c037",
      "name": "Fetch Venice API Data",
      "credentials": {
        "httpBearerAuth": {
          "id": "izusTjMe1zMK2yYn",
          "name": "Venice Key Tests"
        }
      }
    },
    {
      "parameters": {
        "options": {}
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        336,
        496
      ],
      "id": "55137f13-f101-4899-9aaa-808763654c79",
      "name": "Extract Balances"
    },
    {
      "parameters": {
        "method": "POST",
        "url": "http://localhost:3000/api/balances",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpBasicAuth",
        "options": {}
      },
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [
        560,
        496
      ],
      "id": "53921055-534c-4294-94c2-77e64a47b0da",
      "name": "Send to Backend",
      "credentials": {
        "httpBasicAuth": {
          "id": "eTYdpHs2674Ov3Ir",
          "name": "testuser1234"
        }
      }
    },
    {
      "parameters": {
        "rule": {
          "interval": [
            {
              "field": "hours"
            }
          ]
        }
      },
      "type": "n8n-nodes-base.scheduleTrigger",
      "typeVersion": 1.2,
      "position": [
        -112,
        400
      ],
      "id": "353fb2bb-23c4-4630-88f7-d55be80088c4",
      "name": "Schedule Trigger1"
    }
  ],
  "connections": {
    "When clicking ‘Execute workflow’": {
      "main": [
        [
          {
            "node": "Fetch Venice API Data",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Fetch Venice API Data": {
      "main": [
        [
          {
            "node": "Extract Balances",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Extract Balances": {
      "main": [
        [
          {
            "node": "Send to Backend",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Schedule Trigger1": {
      "main": [
        [
          {
            "node": "Fetch Venice API Data",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "pinData": {},
  "meta": {
    "instanceId": "b460d70c29fde5d3a0c93ef72afd76f0bc3eaf4ee6ccd8420146b5caf6554ac1"
  }
}