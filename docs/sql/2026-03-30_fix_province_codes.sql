-- Fix incorrect province codes based on updated mapping

UPDATE provinces SET code = 1  WHERE name = 'HA NOI';
UPDATE provinces SET code = 15 WHERE name = 'LAO CAI';
UPDATE provinces SET code = 19 WHERE name = 'THAI NGUYEN';
UPDATE provinces SET code = 20 WHERE name = 'LANG SON';
UPDATE provinces SET code = 22 WHERE name = 'QUANG NINH';
UPDATE provinces SET code = 24 WHERE name = 'BAC NINH';
UPDATE provinces SET code = 25 WHERE name = 'PHU THO';
UPDATE provinces SET code = 31 WHERE name = 'HAI PHONG';
UPDATE provinces SET code = 33 WHERE name = 'HUNG YEN';
UPDATE provinces SET code = 37 WHERE name = 'NINH BINH';
UPDATE provinces SET code = 38 WHERE name = 'THANH HOA';
UPDATE provinces SET code = 40 WHERE name = 'NGHE AN';
UPDATE provinces SET code = 42 WHERE name = 'HA TINH';
UPDATE provinces SET code = 44 WHERE name = 'QUANG TRI';
UPDATE provinces SET code = 46 WHERE name = 'HUE';
UPDATE provinces SET code = 48 WHERE name = 'DA NANG';
UPDATE provinces SET code = 51 WHERE name = 'QUANG NGAI';
UPDATE provinces SET code = 52 WHERE name = 'GIA LAI';
UPDATE provinces SET code = 56 WHERE name = 'KHANH HOA';
UPDATE provinces SET code = 75 WHERE name = 'DONG NAI';
UPDATE provinces SET code = 79 WHERE name = 'HO CHI MINH';
UPDATE provinces SET code = 80 WHERE name = 'TAY NINH';
UPDATE provinces SET code = 82 WHERE name = 'DONG THAP';
UPDATE provinces SET code = 86 WHERE name = 'VINH LONG';
UPDATE provinces SET code = 91 WHERE name = 'AN GIANG';
UPDATE provinces SET code = 92 WHERE name = 'CAN THO';
UPDATE provinces SET code = 96 WHERE name = 'CA MAU';
