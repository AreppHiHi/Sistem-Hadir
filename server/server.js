require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// ==========================================
// KONFIGURASI SUPABASE 
// ==========================================
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Fungsi jana ID rawak (Cth: 4829)
const generateParticipantId = () => Math.floor(1000 + Math.random() * 9000).toString();

// ==========================================
// ZON 1: PENDAFTARAN & LOG MASUK
// ==========================================
app.post('/api/register', async (req, res) => {
  // Ditambah: nama_ringkas_koperasi
  const { full_name, email, phone, password, koperasi, nama_ringkas_koperasi } = req.body;
  
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    let p_id = generateParticipantId();
    let isUnique = false;

    // Pastikan ID yang dijana unik di dalam pangkalan data
    while (!isUnique) {
      const { data } = await supabase.from('participants').select('p_id').eq('p_id', p_id).single();
      if (!data) isUnique = true;
      else p_id = generateParticipantId();
    }

    // Masukkan data pengguna ke Supabase
    const { data, error } = await supabase.from('participants').insert([{ 
      full_name: full_name.trim(), 
      email: email.trim().toLowerCase(), 
      phone: phone.trim(), 
      koperasi: koperasi ? koperasi.trim() : 'Tiada Maklumat',
      nama_ringkas_koperasi: nama_ringkas_koperasi ? nama_ringkas_koperasi.trim() : 'Tiada',
      p_id, 
      password: hashedPassword 
    }]).select();

    if (error) throw error;
    res.status(201).json({ message: "Pendaftaran Berjaya", data: data[0] });
  } catch (error) { 
    res.status(400).json({ error: error.message }); 
  }
});

app.post('/api/login', async (req, res) => {
  const { identifier, password } = req.body;
  const cleanIdentifier = identifier.trim();

  // Semakan Khas untuk Admin
  if (cleanIdentifier === 'admin' && password === 'admin123') {
    return res.status(200).json({ message: "Log Masuk Admin", role: 'admin', user: { full_name: "Super Admin", role: "admin" } });
  }

  try {
    let query = supabase.from('participants').select('*');
    // Jika input adalah nombor sahaja, cari di p_id. Jika tidak, cari di email.
    if (/^\d+$/.test(cleanIdentifier)) query = query.eq('p_id', cleanIdentifier);
    else query = query.ilike('email', cleanIdentifier.toLowerCase());

    const { data: user, error } = await query.single();
    if (error || !user) return res.status(401).json({ error: "ID atau Emel tidak wujud" });
    if (!user.password) return res.status(401).json({ error: "Sila hubungi admin untuk set semula kata laluan." });

    // Padankan kata laluan
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Kata laluan salah!" });

    delete user.password; // Buang kata laluan dari dipulangkan ke frontend atas faktor keselamatan
    res.status(200).json({ message: "Log Masuk Berjaya", user: user });
  } catch (error) { 
    res.status(500).json({ error: "Ralat Pelayan" }); 
  }
});

// ==========================================
// ZONE 2 API: PROSES LUPA KATA LALUAN & HANTAR OTP
// ==========================================
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;

  // 1. Pastikan e-mel dimasukkan
  if (!email) {
    return res.status(400).json({ error: "Sila masukkan e-mel anda." });
  }

  try {
    // 2. Semak pangkalan data Supabase sama ada e-mel wujud atau tidak
    // (Gantikan 'participants' dengan nama jadual sebenar anda jika berbeza)
    const { data: user, error: userError } = await supabase
      .from('participants')
      .select('email')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: "E-mel tidak berdaftar di dalam Sistem Hadir." });
    }

    // 3. Jana Kod OTP 6-Digit Rawak
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // 4. (PILIHAN) Jika anda ada jadual untuk simpan OTP sementara di Supabase, masukkan kod simpanan di sini.
    // Contoh: await supabase.from('otp_table').insert([{ email, otp_code: otpCode }]);

    // 5. Konfigurasi data e-mel API Brevo
    const emailData = {
      sender: { 
        name: "Admin Sistem Hadir", 
        email: "ariffhihi810@gmail.com" // GUNA E-MEL YANG DIDAFTARKAN DI BREVO
      },
      to: [{ email: email }],
      subject: "Kod Pengesahan (OTP) Lupa Kata Laluan",
      htmlContent: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
          <h2 style="color: #0f172a; text-align: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">Sistem Hadir Bengkel Koperasi</h2>
          <p style="color: #334155; font-size: 16px;">Seseorang telah memohon untuk menetapkan semula kata laluan bagi akaun anda.</p>
          <p style="color: #334155; font-size: 16px;">Sila gunakan kod pengesahan (OTP) 6-digit di bawah untuk meneruskan proses penukaran kata laluan:</p>
          
          <div style="background-color: #f8fafc; border: 2px dashed #94a3b8; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #1e293b; margin: 25px 0; border-radius: 8px;">
            ${otpCode} 
          </div>
          
          <p style="font-size: 13px; color: #64748b; text-align: center;">Jika anda tidak membuat permohonan ini, sila abaikan e-mel ini. Kod ini adalah sulit dan jangan kongsi dengan sesiapa.</p>
        </div>
      `
    };

    // 6. Hantar permintaan ke API Brevo menggunakan Axios
    await axios.post('https://api.brevo.com/v3/smtp/email', emailData, {
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    console.log(`[SUKSES] E-mel OTP dihantar kepada: ${email}`);
    
    // 7. Pulangkan jawapan sukses kepada Vercel/Frontend
    return res.status(200).json({ message: "Kod OTP telah berjaya dihantar ke e-mel anda." });

  } catch (error) {
    console.error("[RALAT BREVO API]:", error.response ? error.response.data : error.message);
    return res.status(500).json({ error: "Sistem pelayan gagal menghantar e-mel. Sila cuba sebentar lagi." });
  }
});

// ==========================================
// ZON 3: INTERAKSI PENGGUNA (PESERTA)
// ==========================================
app.post('/api/user/join-event', async (req, res) => {
  const { p_id, event_id } = req.body;
  try {
    const { data: existing } = await supabase.from('event_registrations').select('*').eq('participant_id', p_id).eq('event_id', event_id).single();
    if (existing) return res.status(400).json({ error: "Anda sudah mendaftar untuk acara ini!" });

    const { error } = await supabase.from('event_registrations').insert([{ participant_id: p_id, event_id: event_id, attended: false }]);
    if (error) throw error;
    res.status(200).json({ message: "Berjaya menyertai acara!" });
  } catch (error) { res.status(500).json({ error: "Ralat mendaftar acara" }); }
});

app.get('/api/user/:p_id/joined-events', async (req, res) => {
  const { p_id } = req.params;
  try {
    const { data, error } = await supabase.from('event_registrations').select('event_id, attended').eq('participant_id', p_id);
    if (error) throw error;
    res.status(200).json(data || []);
  } catch (error) { res.status(500).json({ error: "Ralat" }); }
});

app.put('/api/user/update-profile', async (req, res) => {
  const { p_id, full_name, email, phone, koperasi } = req.body;
  try {
    const { data, error } = await supabase.from('participants')
      .update({ full_name: full_name.trim(), email: email.trim().toLowerCase(), phone: phone.trim(), koperasi: koperasi.trim() })
      .eq('p_id', p_id).select();
      
    if (error) throw error;
    if (data.length === 0) return res.status(404).json({ error: "Pengguna tidak dijumpai" });
    res.status(200).json({ message: "Profil berjaya dikemaskini!", user: data[0] });
  } catch (error) { res.status(500).json({ error: "Gagal mengemaskini profil." }); }
});

app.post('/api/checkin', async (req, res) => {
  const { p_id, qr_data } = req.body;
  if (!qr_data || !qr_data.startsWith("HADIR-EVENT-")) return res.status(400).json({ error: "QR Code tidak sah!" });
  
  const event_id = qr_data.replace("HADIR-EVENT-", "");
  try {
    const { data, error } = await supabase.from('event_registrations').update({ attended: true }).eq('participant_id', p_id).eq('event_id', event_id).select();
    if (error || data.length === 0) return res.status(400).json({ error: "Anda belum mendaftar acara ini!" });
    res.status(200).json({ message: "Kehadiran Berjaya Direkodkan!" });
  } catch (error) { res.status(500).json({ error: "Ralat merekod kehadiran." }); }
});

// ==========================================
// ZON 4: PAPAN PEMUKA ADMIN
// ==========================================
app.get('/api/admin/participants', async (req, res) => {
  try {
    // Ditambah: Menarik data nama_ringkas_koperasi dari DB
    const { data, error } = await supabase.from('participants').select('id, full_name, email, phone, koperasi, nama_ringkas_koperasi, p_id, is_present').order('id', { ascending: false });
    if (error) throw error; res.status(200).json(data);
  } catch (error) { res.status(500).json({ error: "Gagal memuat turun." }); }
});

app.post('/api/admin/reset-password', async (req, res) => {
  const { p_id } = req.body;
  const DEFAULT_PASSWORD = "pass123"; 
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, salt);
    const { data, error } = await supabase.from('participants').update({ password: hashedPassword }).eq('p_id', p_id).select();
    if (error || data.length === 0) return res.status(404).json({ error: "Peserta tidak dijumpai" });
    res.status(200).json({ message: `Kata laluan ditukar kepada: ${DEFAULT_PASSWORD}` });
  } catch (error) { res.status(500).json({ error: "Ralat pelayan." }); }
});

app.get('/api/admin/events', async (req, res) => {
  try {
    const { data, error } = await supabase.from('events').select('*').order('date', { ascending: false });
    if (error) throw error; res.status(200).json(data);
  } catch (error) { res.status(500).json({ error: "Gagal memuat turun." }); }
});

app.post('/api/admin/events', async (req, res) => {
  const { title, description, date, time, location, type, capacity, status } = req.body;
  try {
    const { data, error } = await supabase.from('events').insert([{ title, description, date, time, location, type, capacity, status }]).select();
    if (error) throw error; res.status(201).json({ message: "Acara berjaya dicipta!", event: data[0] });
  } catch (error) { res.status(500).json({ error: "Gagal mencipta acara" }); }
});

app.put('/api/admin/events/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, date, time, location, type, capacity, status } = req.body;
  try {
    const { data, error } = await supabase.from('events').update({ title, description, date, time, location, type, capacity, status }).eq('id', id).select();
    if (error) throw error; res.status(200).json({ message: "Acara berjaya dikemas kini!", event: data[0] });
  } catch (error) { res.status(500).json({ error: "Gagal mengemas kini." }); }
});

app.delete('/api/admin/events/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) throw error; res.status(200).json({ message: "Berjaya dipadam!" });
  } catch (error) { res.status(500).json({ error: "Gagal memadam." }); }
});

app.get('/api/admin/events/:id/participants', async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase.from('event_registrations').select(`attended, participants (p_id, full_name, email, phone)`).eq('event_id', id);
    if (error) throw error; res.status(200).json(data);
  } catch (error) { res.status(500).json({ error: "Ralat pelayan." }); }
});

app.get('/api/admin/participants/:p_id/history', async (req, res) => {
  const { p_id } = req.params;
  try {
    const { data, error } = await supabase.from('event_registrations').select(`attended, events (title, date, location)`).eq('participant_id', p_id);
    if (error) throw error; res.status(200).json(data);
  } catch (error) { res.status(500).json({ error: "Ralat pelayan." }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => { console.log(`Server Successfully running on port ${PORT}`); });