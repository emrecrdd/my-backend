const { Statistics } = require('../models');  // Statistics modelini doğru import ettiğinizden emin olun!

// Abone ekleme
exports.subscribe = async (req, res) => {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7);  // Yıl-Ay formatında (ör: '2025-04')

    let stats = await Statistics.findOne();
    if (!stats) {
      stats = await Statistics.create({
        totalSubscribers: 1,
        monthlySubscribers: [{ month: currentMonth, subscribers: 1 }],
        monthlyEmailsSent: []
      });
    } else {
      stats.totalSubscribers += 1;

      // Aylık abone sayısını güncelle
      const monthData = stats.monthlySubscribers.find(item => item.month === currentMonth);
      if (monthData) {
        monthData.subscribers += 1;
      } else {
        stats.monthlySubscribers.push({ month: currentMonth, subscribers: 1 });
      }
    }

    await stats.save();  // Veritabanında sadece bir kez save yapılıyor

    res.status(200).json({ message: "Abone sayısı güncellendi." });
  } catch (error) {
    console.error('Abone istatistiği güncelleme hatası:', error);
    res.status(500).json({ message: 'Abone istatistiğini güncelleme sırasında bir hata oluştu.' });
  }
};

// E-posta gönderme
exports.emailSent = async (req, res) => {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7);  // Yıl-Ay formatında (ör: '2025-04')

    let stats = await Statistics.findOne();
    if (!stats) {
      stats = await Statistics.create({
        totalEmailsSent: 1,
        monthlySubscribers: [],
        monthlyEmailsSent: [{ month: currentMonth, emailsSent: 1 }]
      });
    } else {
      stats.totalEmailsSent += 1;

      // Aylık gönderilen e-posta sayısını güncelle
      const monthData = stats.monthlyEmailsSent.find(item => item.month === currentMonth);
      if (monthData) {
        monthData.emailsSent += 1;
      } else {
        stats.monthlyEmailsSent.push({ month: currentMonth, emailsSent: 1 });
      }
    }

    await stats.save();  // Veritabanında sadece bir kez save yapılıyor

    res.status(200).json({ message: 'E-posta gönderim sayısı güncellendi.' });
  } catch (error) {
    console.error('E-posta gönderim hatası:', error);
    res.status(500).json({ message: 'E-posta gönderim istatistiğini güncelleme sırasında bir hata oluştu.' });
  }
};

// E-posta açılma
exports.emailOpened = async (req, res) => {
  try {
    let stats = await Statistics.findOne();
    if (!stats) {
      stats = await Statistics.create({ totalEmailsOpened: 1 });
    } else {
      stats.totalEmailsOpened += 1;
    }

    await stats.save();  // Veritabanında sadece bir kez save yapılıyor

    res.status(200).send();
  } catch (error) {
    console.error('E-posta açılma hatası:', error);
    res.status(500).json({ message: 'E-posta açılma istatistiğini güncelleme sırasında bir hata oluştu.' });
  }
};

// İstatistikleri al
exports.getStatistics = async (req, res) => {
  try {
    let stats = await Statistics.findOne();

    // Eğer istatistik bulunamazsa, boş bir istatistik oluştur
    if (!stats) {
      const currentMonth = new Date().toISOString().slice(0, 7);
      stats = await Statistics.create({
        totalSubscribers: 0,
        totalEmailsSent: 0,
        totalEmailsOpened: 0,
        monthlySubscribers: [{ month: currentMonth, subscribers: 0 }],
        monthlyEmailsSent: [{ month: currentMonth, emailsSent: 0 }]
      });
    }

    res.json(stats);
  } catch (error) {
    console.error('İstatistik alma hatası:', error);
    res.status(500).json({ message: 'İstatistikleri alma sırasında bir hata oluştu.' });
  }
};

// Abone silindikten sonra istatistik güncelleme
exports.updateAfterDelete = async (req, res) => {
  try {
      const currentMonth = new Date().toISOString().slice(0, 7);  // Yıl-Ay formatında (ör: '2025-04')

      let stats = await Statistics.findOne();
      if (stats) {
          // Toplam abone sayısını bir azalt
          stats.totalSubscribers -= 1;

          // Aylık abone sayısını güncelle
          const monthData = stats.monthlySubscribers.find(item => item.month === currentMonth);
          if (monthData) {
              monthData.subscribers -= 1;
          }

          // İstatistikleri kaydet
          await stats.save();
      }
      
      res.status(200).json({ message: 'İstatistikler başarıyla güncellendi.' });
  } catch (error) {
      console.error('İstatistikler güncellenirken bir hata oluştu:', error);
      res.status(500).json({ message: 'İstatistikler güncellenirken bir hata oluştu.' });
  }
};
