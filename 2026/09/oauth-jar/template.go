package main

import (
	"encoding/json"
	"html/template"
	"sort"
)

type claimRow struct {
	Key   string
	Value string
}

type loginLink struct {
	Name string
	URL  string
}

// claimsToRows converts any struct to sorted claim rows via JSON marshaling.
func claimsToRows(v any) []claimRow {
	b, _ := json.Marshal(v)
	var m map[string]any
	_ = json.Unmarshal(b, &m)

	keys := make([]string, 0, len(m))
	for k := range m {
		keys = append(keys, k)
	}
	sort.Strings(keys)

	rows := make([]claimRow, 0, len(m))
	for _, k := range keys {
		val := m[k]
		var s string
		switch tv := val.(type) {
		case string:
			s = tv
		default:
			enc, _ := json.Marshal(tv)
			s = string(enc)
		}
		rows = append(rows, claimRow{Key: k, Value: s})
	}
	return rows
}

var homeTmpl = template.Must(template.New("home").Parse(`<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>Home – Token Claims</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: system-ui, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f3f4f6;
      padding: 2rem;
    }
    .container {
      display: flex;
      gap: 2rem;
      align-items: flex-start;
    }
    .card {
      background: #fff;
      border-radius: 0.75rem;
      box-shadow: 0 2px 8px rgba(0,0,0,.1);
      overflow: hidden;
      min-width: 340px;
    }
    .card-title {
      padding: 0.75rem 1rem;
      font-size: 0.9rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .05em;
      color: #fff;
      background: #4f46e5;
    }
    .card-title.access { background: #0891b2; }
    table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
    th, td { padding: 0.5rem 0.75rem; text-align: left; border-bottom: 1px solid #e5e7eb; word-break: break-all; }
    th { width: 38%; color: #6b7280; font-weight: 600; background: #f9fafb; }
    tr:last-child td, tr:last-child th { border-bottom: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="card-title access">Access Token Claims</div>
      <table>
        {{- range .AccessClaims}}
        <tr><th>{{.Key}}</th><td>{{.Value}}</td></tr>
        {{- end}}
      </table>
    </div>
    <div class="card">
      <div class="card-title">ID Token Claims</div>
      <table>
        {{- range .IDClaims}}
        <tr><th>{{.Key}}</th><td>{{.Value}}</td></tr>
        {{- end}}
      </table>
    </div>
  </div>
</body>
</html>
`))

var indexTmpl = template.Must(template.New("index").Parse(`<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>OAuth JAR verification profiles</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background: #f3f4f6;
      color: #111827;
      font-family: system-ui, sans-serif;
    }
    main {
      width: min(100%, 42rem);
      text-align: center;
    }
    h1 { margin-bottom: 1.5rem; font-size: 1.5rem; }
    ul { display: grid; gap: 0.75rem; padding: 0; list-style: none; }
    .login-link {
      display: block;
      padding: 0.8rem 1rem;
      border-radius: 0.5rem;
      background: #fff;
      color: #3730a3;
      box-shadow: 0 2px 8px rgba(0,0,0,.1);
      text-decoration: none;
    }
    .login-link:hover { background: #eef2ff; }
  </style>
</head>
<body>
  <main>
    <h1>OAuth JAR verification profiles</h1>
    <ul>
      {{- range .}}
      <li><a class="login-link" href="{{.URL}}">{{.Name}}</a></li>
      {{- end}}
    </ul>
  </main>
</body>
</html>
`))
