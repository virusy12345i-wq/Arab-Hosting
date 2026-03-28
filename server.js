const express = require('express');
const axios = require('axios');
const session = require('express-session');
const app = express();

// إعدادات التحكم (تعدلها الإدارة)
let settings = {
    jobsOpen: true,
    applyOpen: true
};

app.use(express.json());
app.use(session({ secret: 'novax_secret_key', resave: false, saveUninitialized: true }));

const CLIENT_ID = 'YOUR_CLIENT_ID';
const CLIENT_SECRET = 'YOUR_CLIENT_SECRET';
const GUILD_ID = 'YOUR_GUILD_ID';
const VERIFIED_ROLE_ID = 'ROLE_ID_HERE';
const ADMIN_ROLE_ID = 'ADMIN_ROLE_ID_HERE';
const WEBHOOK_URL = 'YOUR_WEBHOOK_URL';

// فحص الرتب من ديسكورد
async function getMemberData(accessToken) {
    const res = await axios.get(`https://discord.com/api/users/@me/guilds/${GUILD_ID}/member`, {
        headers: { Authorization: `Bearer ${accessToken}` }
    });
    return res.data;
}

// مسار التقديم
app.post('/api/apply', async (req, res) => {
    if (!settings.applyOpen) return res.status(403).json({ m: 'التقديم مغلق حالياً' });
    
    const member = await getMemberData(req.session.token);
    if (member.roles.includes(VERIFIED_ROLE_ID)) {
        return res.status(403).json({ m: 'أنت مفعل بالفعل، لا يمكنك التقديم مرة أخرى' });
    }

    // إرسال الويب هوك
    await axios.post(WEBHOOK_URL, {
        embeds: [{
            title: "تقديم جديد - NoVaX",
            fields: [
                { name: "المستخدم", value: member.user.username },
                { name: "البيانات", value: req.body.data }
            ],
            color: 0x9403fc
        }]
    });
    res.json({ m: 'تم التقديم بنجاح' });
});

// لوحة الإدارة (فحص رتبة الإدارة)
app.get('/admin', async (req, res) => {
    const member = await getMemberData(req.session.token);
    if (!member.roles.includes(ADMIN_ROLE_ID)) return res.send("غير مصرح لك");
    res.send("واجهة الإدارة هنا - يمكنك قفل الوظائف");
});

app.listen(3000, () => console.log("NoVaX System Online 💀"));
