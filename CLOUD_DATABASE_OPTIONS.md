# Cloud Database Options

## Free Cloud Databases

### 1. **Supabase (Recommended)**
- **Database:** PostgreSQL
- **Free Tier:** 500MB storage, 2 concurrent connections
- **Features:** Real-time subscriptions, authentication, file storage
- **Setup:** https://supabase.com

```javascript
// Install
npm install @supabase/supabase-js

// Connect
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('your-url', 'your-anon-key')
```

### 2. **PlanetScale**
- **Database:** MySQL
- **Free Tier:** 5GB storage, 1 billion reads/month
- **Features:** Branching, schema migrations
- **Setup:** https://planetscale.com

### 3. **Railway**
- **Database:** PostgreSQL/MySQL
- **Free Tier:** $5 credit monthly
- **Features:** Easy deployment
- **Setup:** https://railway.app

### 4. **Neon**
- **Database:** PostgreSQL
- **Free Tier:** 3GB storage
- **Features:** Serverless, autoscaling
- **Setup:** https://neon.tech

## Setup Example (Supabase)

1. **Create account** at supabase.com
2. **Create new project**
3. **Get connection details:**
   - URL: `https://xxx.supabase.co`
   - API Key: `eyJhbGc...`
4. **Use in your app:**

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://your-project.supabase.co'
const supabaseKey = 'your-anon-key'
const supabase = createClient(supabaseUrl, supabaseKey)

// Create user
const { data, error } = await supabase
  .from('users')
  .insert([
    { name: 'John', email: 'john@example.com' }
  ])

// Get users
const { data, error } = await supabase
  .from('users')
  .select('*')
```

## Comparison

| Service | Database | Free Storage | Best For |
|---------|----------|--------------|----------|
| Supabase | PostgreSQL | 500MB | Full-stack apps |
| PlanetScale | MySQL | 5GB | High performance |
| Railway | PostgreSQL/MySQL | $5 credit | Easy deployment |
| Neon | PostgreSQL | 3GB | Serverless apps |
