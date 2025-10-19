import express from 'express';
import { WebcastPushConnection } from 'tiktok-live-connector';

const app = express();
const port = process.env.PORT || 3000;

// Serve HTML page
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>mrliveboii TikTok Live Dashboard</title>
        <style>
          body { background:#0e0e0e; color:white; font-family:sans-serif; margin:0; padding:0;}
          h1 { text-align:center; padding:10px 0; }
          .container { display:flex; flex-wrap:wrap; justify-content:center; gap:20px; padding:10px; }
          .box { background:#1a1a1a; padding:15px; border-radius:10px; width:220px; min-height:50px; }
          #chat { width:400px; height:400px; overflow-y:scroll; }
          .label { font-weight:bold; margin-bottom:5px; display:block; }
          #giftsList div { border-bottom:1px solid #333; padding:2px 0; font-size:14px;}
        </style>
      </head>
      <body>
        <h1>mrliveboii TikTok Live Dashboard</h1>
        <div class="container">
          <div class="box"><span class="label">❤️ Likes</span><div id="likes">0</div></div>
          <div class="box"><span class="label">👀 Viewers</span><div id="viewers">0</div></div>
          <div class="box"><span class="label">➕ Followers</span><div id="followers">0</div></div>
          <div class="box"><span class="label">🎁 Gifts (latest)</span><div id="giftsList"></div></div>
          <div class="box"><span class="label">Top Gifters</span><div id="topgifters"></div></div>
          <div class="box" id="chat"><span class="label">💬 Live Chat</span></div>
        </div>

        <script type="module">
          import { WebcastPushConnection } from 'https://cdn.skypack.dev/tiktok-live-connector';

          const likesEl = document.getElementById('likes');
          const viewersEl = document.getElementById('viewers');
          const followersEl = document.getElementById('followers');
          const giftsListEl = document.getElementById('giftsList');
          const topGiftersEl = document.getElementById('topgifters');
          const chatEl = document.getElementById('chat');

          let totalLikes = 0;
          let followersCount = 0;
          let gifterMap = {};

          const tiktok = new WebcastPushConnection('mrliveboii');

          tiktok.connect().then(() => console.log("Connected!")).catch(e => console.error(e));

          tiktok.on('like', data => {
            totalLikes += data.likeCount;
            likesEl.innerText = totalLikes;
          });

          tiktok.on('gift', data => {
            // Display the gift with username, gift name, and coin value
            const giftDiv = document.createElement('div');
            giftDiv.innerText = data.uniqueId + " sent " + data.giftName + " (" + data.diamondCount + " coins)";
            giftsListEl.prepend(giftDiv);

            // Keep only the last 10 gifts
            if (giftsListEl.children.length > 10) giftsListEl.removeChild(giftsListEl.lastChild);

            // Update top gifters
            gifterMap[data.uniqueId] = (gifterMap[data.uniqueId] || 0) + data.diamondCount;
            const sorted = Object.entries(gifterMap).sort((a,b)=>b[1]-a[1]);
            topGiftersEl.innerText = sorted.map(e => e[0] + " x" + e[1]).slice(0,5).join("\\n");
          });

          tiktok.on('follow', data => {
            followersCount += 1;
            followersEl.innerText = followersCount;
          });

          tiktok.on('chat', data => {
            const msg = document.createElement('div');
            msg.innerText = data.uniqueId + ": " + data.comment;
            chatEl.appendChild(msg);
            chatEl.scrollTop = chatEl.scrollHeight;
          });

          tiktok.on('viewer', data => {
            viewersEl.innerText = data.viewerCount;
          });
        </script>
      </body>
    </html>
  `);
});

app.listen(port, () => console.log(`Dashboard running at http://localhost:${port}`));
