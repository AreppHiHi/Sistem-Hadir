require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

// ==========================================
// KONFIGURASI SUPABASE & NODEMAILER
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
// ZON 2: LUPA KATA LALUAN (OTP MELALUI EMEL)
// ==========================================
app.post('/api/forgot-password/request-otp', async (req, res) => {
  const { email } = req.body;
  const targetEmail = email.trim().toLowerCase();
  
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); 

  try {
    const { data, error } = await supabase.from('participants')
      .update({ reset_token: otp })
      .eq('email', targetEmail).select();
      
    if (error || data.length === 0) return res.status(404).json({ error: "Emel tidak berdaftar di dalam sistem." });

    const mailOptions = {
      from: `"Sistem HADIR" <${process.env.EMAIL_USER}>`,
      to: targetEmail,
      subject: "Kod Pengesahan (OTP) Lupa Kata Laluan",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
          <h2 style="color: #2563eb;">Sistem HADIR</h2>
          <p>Anda telah meminta untuk menetapkan semula kata laluan anda.</p>
          <p>Berikut adalah kod OTP 6-digit anda:</p>
          <h1 style="font-size: 32px; letter-spacing: 5px; color: #1e293b; background: #f8fafc; padding: 15px; border-radius: 10px; display: inline-block;">
            ${otp}
          </h1>
          <p style="color: #ef4444; font-size: 12px; margin-top: 20px;">*Jika anda tidak membuat permintaan ini, sila abaikan emel ini.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Kod OTP telah dihantar ke emel anda." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Gagal menghantar emel OTP. Pastikan tetapan emel pelayan betul." });
  }
});

app.post('/api/forgot-password/reset', async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const { data, error } = await supabase.from('participants')
      .update({ password: hashedPassword, reset_token: null }) 
      .eq('email', email.trim().toLowerCase())
      .eq('reset_token', otp.trim())
      .select();

    if (error || data.length === 0) return res.status(400).json({ error: "Kod OTP tidak sah atau salah." });

    res.status(200).json({ message: "Kata laluan berjaya ditukar! Sila log masuk." });
  } catch (error) {
    res.status(500).json({ error: "Ralat semasa menukar kata laluan." });
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