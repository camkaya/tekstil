const express = require("express");
const app = express();
const dbConn = require("./db/mysql_connection.js");
const routes = require('./routers/routes.js');
require('dotenv/config');

app.set("view engine","ejs");
app.use(express.static('public'));
app.use(express.static('node_modules'));
app.use(express.urlencoded({ extended: true }));
app.use("/",routes);
app.use("/homepage",routes);
app.use("/graphic",routes);

//login için check yapan kısım
app.post('/login-check', (req, res) => {
    const { username, password } = req.body;
    dbConn.query(
        "SELECT * FROM yonetici WHERE yonetici_ad = ? AND sifre = ?", 
        [username, password], 
        (err, results) => {
            if (err) {
                console.error(err);
                res.status(500).send("Veritabanı hatası");
            } else {
                if (results.length > 0) {
                    res.redirect("/homepage");
                } else {
                    res.redirect("/");
                }
            }
        }
    );
});
//product sayfasına ürün bilgilerini çekme
app.get('/product', (req, res) => {
    dbConn.query("SELECT * FROM urun,toplam_satis,sezon WHERE urun.urun_id = toplam_satis.urun_id and urun.sezon_id = sezon.sezon_id", (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).send("Veritabanı hatası");
        return;
      }
  
      if (results.length > 0) {
        res.render('product', { products: results });
      } else {
        res.send("Tabloda veri bulunamadı.");
      }
    });
  });
//product kısmındaki input kısmı - toplam getiriye göre
app.post('/urun_aciklama', (req, res) => {
    const { deger } = req.body;

    // Kullanıcı adı ve şifreyi veritabanında sorgula
    dbConn.query("SET @p0 = ?", [deger], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send("Veritabanı hatası");
            return;
        }

        // @p0 değişkenini kullanarak saklı yordamı çağır
        dbConn.query("CALL `urun_aciklama`(@p0)", (err, results) => {
            if (err) {
                console.error(err);

                // Hata mesajını al ve istemciye gönder
                const errorMessage = err.message || 'Saklı yordam hatası';
                res.status(500).send(errorMessage);
            } else {
                res.redirect('/product');
            }
        });
    });
});
//store kısmına magaza bilgisi ve magaza sayısı bilgisi çekme
app.get('/store', (req, res) => {
  dbConn.query("SELECT * FROM magazalara_gore_gelir,magaza,ilce where magazalara_gore_gelir.magaza_id = magaza.magaza_id and magaza.ilce_id = ilce.ilce_id ", (err, stores) => {
    if (err) {
      console.error(err);
      res.status(500).send("Veritabanı hatası");
      return;
    }

    if (stores.length > 0) {
      res.render('store', { stores: stores });
    } else {
      res.send("Tabloda veri bulunamadı.");
    }
  });
});
app.get('/store', (req, res) => {
  dbConn.query("SELECT ilce.ilce_ad, count(magaza.magaza_id) as sayi FROM ilce, magaza WHERE ilce.ilce_id = magaza.ilce_id GROUP BY ilce.ilce_id", (err, magaza_sayi) => {
    if (err) {
      console.error(err);
      res.status(500).send("Veritabanı hatası");
      return;
    }

    if (magaza_sayi.length > 0) {
      res.render('store', { magaza_sayi: magaza_sayi });
    } else {
      res.send("Tabloda veri bulunamadı.");
    }
  });
});
//store kısmındaki tablolar
app.get('/store_chart1', (req, res) => {
  const query = 'SELECT * FROM `magazalara_gore_gelir`';
  dbConn.query(query, (error, data) => {
    if (error) {
      console.error('MySQL query error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.json(data);
  });
});
app.get('/store_chart2', (req, res) => {
  const query = 'SELECT ilce.ilce_ad, count(magaza.magaza_id) as sayi FROM ilce, magaza WHERE ilce.ilce_id = magaza.ilce_id GROUP BY ilce.ilce_id';
  dbConn.query(query, (error, data) => {
    if (error) {
      console.error('MySQL query error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.json(data);
    res
  });
});
app.listen(process.env.PORT)


