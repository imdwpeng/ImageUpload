/**
 * Created by dwp on 17/8/4.
 */

$('#files').on('change', function () {
    uploadImage(this.files[0])
});

var _mu_working = false;
var _mu_chunk_size = 1024 * 5120;
var _mu_api = 'http://m0.api.upyun.com/';
var _mu_bucket = 'imdwpeng'; // TODO 空间名
var _mu_form_api_secret = 'RDiq2CxiQA8+IXvSh/hiI9q2uyc='; // TODO 秘钥
var _mu_path = '/dwp/'; //目标路径


function uploadImage(file, callback) {
    mu_upload(file, callback);
}

function mu_upload(file, callback) {
    console.log('准备上传文件: ' + file.name + ' , 生成 MD5 校验中... <span id="md5-process"></span>');
    var n = new Date().getTime();

    get_file_content_md5(file, function (file, md5, md5s, parts) {
        console.log('耗时: ' + (new Date().getTime() - n) + ' 毫秒');
        var _job = new mu_upload_job();
        _job.callback = callback;
        _job.url = _mu_api + _mu_bucket + '/';
        _job.done = false;
        _job.n = 0;
        _job.md5 = md5;
        _job.md5s = md5s;
        _job.parts = parts;
        _job.file_size = file.size;
        _job.file_type = file.name.substring(file.name.lastIndexOf('.'));
        _job.tofilename = file.name.substring(0,file.name.lastIndexOf('.'));
        get_upload_token(_job);
    });
}

function get_file_content_md5(file, callback) {
    var fr = new FileReader();  //读取文件

    fr.onload = function (e) {
        e.target.pos += e.target.result.byteLength;
        e.target.md5.update(new Uint8Array(e.target.result));
        e.target.md5s[e.target.n++] = _MD5(new Uint8Array(e.target.result));

        if (e.target.size > e.target.pos) {
            var t = e.target;
            t.parts[t.n] = slice(t.file, t.pos, t.pos + _mu_chunk_size);
            setTimeout(function () {
                t.readAsArrayBuffer(slice(t.file, t.pos, t.pos + _mu_chunk_size));
            }, 0);
        } else {
            e.target.cb(e.target.file, toHexString(e.target.md5.digest()), e.target.md5s, e.target.parts);
        }
    };
    fr.onerror = function (e) {
        e.target.cb(e.target.file, null);
    };
    fr.md5 = new MD5();
    fr.md5s = [];
    fr.parts = [];
    fr.n = 0;
    fr.cb = callback;
    fr.file = file;
    fr.size = file.size;
    fr.pos = 0;
    fr.parts[fr.n] = slice(fr.file, fr.pos, fr.pos + _mu_chunk_size);
    fr.readAsArrayBuffer(slice(fr.file, 0, _mu_chunk_size));   //将文件读取为ArrayBuffer
}

MD5 = function () {
    this.chain_ = Array(4);
    this.block_ = Array(64);
    this.totalLength_ = this.blockLength_ = 0;
    this.reset()
};
MD5.prototype.reset = function () {
    this.chain_[0] = 1732584193;
    this.chain_[1] = 4023233417;
    this.chain_[2] = 2562383102;
    this.chain_[3] = 271733878;
    this.totalLength_ = this.blockLength_ = 0
};
MD5.prototype.compress_ = function (h, g) {
    g || (g = 0);
    var f = Array(16);
    if ("string" == typeof h)for (var b = 0; 16 > b; ++b)f[b] = h.charCodeAt(g++) | h.charCodeAt(g++) << 8 | h.charCodeAt(g++) << 16 | h.charCodeAt(g++) << 24; else for (b = 0; 16 > b; ++b)f[b] = h[g++] | h[g++] << 8 | h[g++] << 16 | h[g++] << 24;
    var b = this.chain_[0], d = this.chain_[1], c = this.chain_[2], e = this.chain_[3], a = 0,
        a = b + (e ^ d & (c ^ e)) + f[0] + 3614090360 & 4294967295, b = d + (a << 7 & 4294967295 | a >>> 25),
        a = e + (c ^ b & (d ^ c)) + f[1] + 3905402710 & 4294967295, e = b + (a << 12 & 4294967295 | a >>> 20),
        a = c + (d ^ e & (b ^ d)) + f[2] +
            606105819 & 4294967295, c = e + (a << 17 & 4294967295 | a >>> 15),
        a = d + (b ^ c & (e ^ b)) + f[3] + 3250441966 & 4294967295, d = c + (a << 22 & 4294967295 | a >>> 10),
        a = b + (e ^ d & (c ^ e)) + f[4] + 4118548399 & 4294967295, b = d + (a << 7 & 4294967295 | a >>> 25),
        a = e + (c ^ b & (d ^ c)) + f[5] + 1200080426 & 4294967295, e = b + (a << 12 & 4294967295 | a >>> 20),
        a = c + (d ^ e & (b ^ d)) + f[6] + 2821735955 & 4294967295, c = e + (a << 17 & 4294967295 | a >>> 15),
        a = d + (b ^ c & (e ^ b)) + f[7] + 4249261313 & 4294967295, d = c + (a << 22 & 4294967295 | a >>> 10),
        a = b + (e ^ d & (c ^ e)) + f[8] + 1770035416 & 4294967295, b = d + (a << 7 & 4294967295 | a >>> 25),
        a = e + (c ^ b & (d ^ c)) +
            f[9] + 2336552879 & 4294967295, e = b + (a << 12 & 4294967295 | a >>> 20),
        a = c + (d ^ e & (b ^ d)) + f[10] + 4294925233 & 4294967295, c = e + (a << 17 & 4294967295 | a >>> 15),
        a = d + (b ^ c & (e ^ b)) + f[11] + 2304563134 & 4294967295, d = c + (a << 22 & 4294967295 | a >>> 10),
        a = b + (e ^ d & (c ^ e)) + f[12] + 1804603682 & 4294967295, b = d + (a << 7 & 4294967295 | a >>> 25),
        a = e + (c ^ b & (d ^ c)) + f[13] + 4254626195 & 4294967295, e = b + (a << 12 & 4294967295 | a >>> 20),
        a = c + (d ^ e & (b ^ d)) + f[14] + 2792965006 & 4294967295, c = e + (a << 17 & 4294967295 | a >>> 15),
        a = d + (b ^ c & (e ^ b)) + f[15] + 1236535329 & 4294967295, d = c + (a << 22 & 4294967295 | a >>> 10), a =
            b + (c ^ e & (d ^ c)) + f[1] + 4129170786 & 4294967295, b = d + (a << 5 & 4294967295 | a >>> 27),
        a = e + (d ^ c & (b ^ d)) + f[6] + 3225465664 & 4294967295, e = b + (a << 9 & 4294967295 | a >>> 23),
        a = c + (b ^ d & (e ^ b)) + f[11] + 643717713 & 4294967295, c = e + (a << 14 & 4294967295 | a >>> 18),
        a = d + (e ^ b & (c ^ e)) + f[0] + 3921069994 & 4294967295, d = c + (a << 20 & 4294967295 | a >>> 12),
        a = b + (c ^ e & (d ^ c)) + f[5] + 3593408605 & 4294967295, b = d + (a << 5 & 4294967295 | a >>> 27),
        a = e + (d ^ c & (b ^ d)) + f[10] + 38016083 & 4294967295, e = b + (a << 9 & 4294967295 | a >>> 23),
        a = c + (b ^ d & (e ^ b)) + f[15] + 3634488961 & 4294967295, c = e + (a << 14 & 4294967295 | a >>>
            18), a = d + (e ^ b & (c ^ e)) + f[4] + 3889429448 & 4294967295, d = c + (a << 20 & 4294967295 | a >>> 12),
        a = b + (c ^ e & (d ^ c)) + f[9] + 568446438 & 4294967295, b = d + (a << 5 & 4294967295 | a >>> 27),
        a = e + (d ^ c & (b ^ d)) + f[14] + 3275163606 & 4294967295, e = b + (a << 9 & 4294967295 | a >>> 23),
        a = c + (b ^ d & (e ^ b)) + f[3] + 4107603335 & 4294967295, c = e + (a << 14 & 4294967295 | a >>> 18),
        a = d + (e ^ b & (c ^ e)) + f[8] + 1163531501 & 4294967295, d = c + (a << 20 & 4294967295 | a >>> 12),
        a = b + (c ^ e & (d ^ c)) + f[13] + 2850285829 & 4294967295, b = d + (a << 5 & 4294967295 | a >>> 27),
        a = e + (d ^ c & (b ^ d)) + f[2] + 4243563512 & 4294967295, e = b + (a << 9 & 4294967295 |
            a >>> 23), a = c + (b ^ d & (e ^ b)) + f[7] + 1735328473 & 4294967295,
        c = e + (a << 14 & 4294967295 | a >>> 18), a = d + (e ^ b & (c ^ e)) + f[12] + 2368359562 & 4294967295,
        d = c + (a << 20 & 4294967295 | a >>> 12), a = b + (d ^ c ^ e) + f[5] + 4294588738 & 4294967295,
        b = d + (a << 4 & 4294967295 | a >>> 28), a = e + (b ^ d ^ c) + f[8] + 2272392833 & 4294967295,
        e = b + (a << 11 & 4294967295 | a >>> 21), a = c + (e ^ b ^ d) + f[11] + 1839030562 & 4294967295,
        c = e + (a << 16 & 4294967295 | a >>> 16), a = d + (c ^ e ^ b) + f[14] + 4259657740 & 4294967295,
        d = c + (a << 23 & 4294967295 | a >>> 9), a = b + (d ^ c ^ e) + f[1] + 2763975236 & 4294967295,
        b = d + (a << 4 & 4294967295 | a >>> 28), a =
            e + (b ^ d ^ c) + f[4] + 1272893353 & 4294967295, e = b + (a << 11 & 4294967295 | a >>> 21),
        a = c + (e ^ b ^ d) + f[7] + 4139469664 & 4294967295, c = e + (a << 16 & 4294967295 | a >>> 16),
        a = d + (c ^ e ^ b) + f[10] + 3200236656 & 4294967295, d = c + (a << 23 & 4294967295 | a >>> 9),
        a = b + (d ^ c ^ e) + f[13] + 681279174 & 4294967295, b = d + (a << 4 & 4294967295 | a >>> 28),
        a = e + (b ^ d ^ c) + f[0] + 3936430074 & 4294967295, e = b + (a << 11 & 4294967295 | a >>> 21),
        a = c + (e ^ b ^ d) + f[3] + 3572445317 & 4294967295, c = e + (a << 16 & 4294967295 | a >>> 16),
        a = d + (c ^ e ^ b) + f[6] + 76029189 & 4294967295, d = c + (a << 23 & 4294967295 | a >>> 9),
        a = b + (d ^ c ^ e) + f[9] + 3654602809 &
            4294967295, b = d + (a << 4 & 4294967295 | a >>> 28),
        a = e + (b ^ d ^ c) + f[12] + 3873151461 & 4294967295, e = b + (a << 11 & 4294967295 | a >>> 21),
        a = c + (e ^ b ^ d) + f[15] + 530742520 & 4294967295, c = e + (a << 16 & 4294967295 | a >>> 16),
        a = d + (c ^ e ^ b) + f[2] + 3299628645 & 4294967295, d = c + (a << 23 & 4294967295 | a >>> 9),
        a = b + (c ^ (d | ~e)) + f[0] + 4096336452 & 4294967295, b = d + (a << 6 & 4294967295 | a >>> 26),
        a = e + (d ^ (b | ~c)) + f[7] + 1126891415 & 4294967295, e = b + (a << 10 & 4294967295 | a >>> 22),
        a = c + (b ^ (e | ~d)) + f[14] + 2878612391 & 4294967295, c = e + (a << 15 & 4294967295 | a >>> 17),
        a = d + (e ^ (c | ~b)) + f[5] + 4237533241 & 4294967295,
        d = c + (a << 21 & 4294967295 | a >>> 11), a = b + (c ^ (d | ~e)) + f[12] + 1700485571 & 4294967295,
        b = d + (a << 6 & 4294967295 | a >>> 26), a = e + (d ^ (b | ~c)) + f[3] + 2399980690 & 4294967295,
        e = b + (a << 10 & 4294967295 | a >>> 22), a = c + (b ^ (e | ~d)) + f[10] + 4293915773 & 4294967295,
        c = e + (a << 15 & 4294967295 | a >>> 17), a = d + (e ^ (c | ~b)) + f[1] + 2240044497 & 4294967295,
        d = c + (a << 21 & 4294967295 | a >>> 11), a = b + (c ^ (d | ~e)) + f[8] + 1873313359 & 4294967295,
        b = d + (a << 6 & 4294967295 | a >>> 26), a = e + (d ^ (b | ~c)) + f[15] + 4264355552 & 4294967295,
        e = b + (a << 10 & 4294967295 | a >>> 22), a = c + (b ^ (e | ~d)) + f[6] + 2734768916 & 4294967295,
        c = e + (a << 15 & 4294967295 | a >>> 17), a = d + (e ^ (c | ~b)) + f[13] + 1309151649 & 4294967295,
        d = c + (a << 21 & 4294967295 | a >>> 11), a = b + (c ^ (d | ~e)) + f[4] + 4149444226 & 4294967295,
        b = d + (a << 6 & 4294967295 | a >>> 26), a = e + (d ^ (b | ~c)) + f[11] + 3174756917 & 4294967295,
        e = b + (a << 10 & 4294967295 | a >>> 22), a = c + (b ^ (e | ~d)) + f[2] + 718787259 & 4294967295,
        c = e + (a << 15 & 4294967295 | a >>> 17), a = d + (e ^ (c | ~b)) + f[9] + 3951481745 & 4294967295;
    this.chain_[0] = this.chain_[0] + b & 4294967295;
    this.chain_[1] = this.chain_[1] + (c + (a << 21 & 4294967295 | a >>> 11)) & 4294967295;
    this.chain_[2] = this.chain_[2] +
        c & 4294967295;
    this.chain_[3] = this.chain_[3] + e & 4294967295
};
MD5.prototype.update = function (h, g) {
    "undefined" == typeof g && (g = h.length);
    for (var f = g - 64, b = this.block_, d = this.blockLength_, c = 0; c < g;) {
        if (0 == d)for (; c <= f;)this.compress_(h, c), c += 64;
        if ("string" == typeof h)for (; c < g;) {
            if (b[d++] = h.charCodeAt(c++), 64 == d) {
                this.compress_(b);
                d = 0;
                break
            }
        } else for (; c < g;)if (b[d++] = h[c++], 64 == d) {
            this.compress_(b);
            d = 0;
            break
        }
    }
    this.blockLength_ = d;
    this.totalLength_ += g
};
MD5.prototype.digest = function () {
    var h = Array((56 > this.blockLength_ ? 64 : 128) - this.blockLength_);
    h[0] = 128;
    for (var g = 1; g < h.length - 8; ++g)h[g] = 0;
    for (var f = 8 * this.totalLength_, g = h.length - 8; g < h.length; ++g)h[g] = f & 255, f /= 256;
    this.update(h);
    h = Array(16);
    for (g = f = 0; 4 > g; ++g)for (var b = 0; 32 > b; b += 8)h[f++] = this.chain_[g] >>> b & 255;
    return h
};

function slice(f, pos, endpos) {
    var r = null;

    if (f.slice)
        r = f.slice(pos, endpos);
    else if (f.webkitSlice)
        r = f.webkitSlice(pos, endpos);
    else if (f.mozSlice)
        r = f.mozSlice(pos, endpos);
    return r;
}

function _MD5(h) {
    var g = new MD5;
    g.update(h);

    return g = toHexString(g.digest())
};

function toHexString(h) {
    return h.map(function (g) {
        g = g.toString(16);
        return 1 < g.length ? g : "0" + g
    }).join("")
}

function mu_upload_job() {
}
mu_upload_job.prototype.on_token = function (r) {
    for (; this.n < this.parts.length && this.n < 2; this.n++) {
        upload_part(this, this.n);
    }
};
mu_upload_job.prototype.on_part_uploaded = function (r) {
    if (this.n < this.parts.length) {
        upload_part(this, this.n);
        this.n++;
    } else if (!this.done) {
        this.done = true;
        upload_done(this);
    }
};
mu_upload_job.prototype.on_done = function (r) {
    var url = 'http://' + _mu_bucket + '.b0.upaiyun.com' + r.path;
    document.getElementById('image').src = url;
};

function get_upload_token(job) {
    console.log('获取上传令牌');
    job.expiration = parseInt((new Date().getTime() + 3600000) / 1000);

    var n = new Date().getTime(),
        num = '',
        random = ''; //十位随机数
    for (var i = 0; i < 10; i++) {
        num += Math.floor(Math.random() * 10)
    }
    random = num + n;

    var file_name = _mu_path + job.tofilename + '-' + random + job.file_type;

    var options = {
        'path': file_name,
        'expiration': job.expiration,
        'file_blocks': job.parts.length,
        'file_size': job.file_size,
        'file_hash': job.md5
    };

    var signature = calcSign(options, _mu_form_api_secret);

    var policy = btoa((JSON.stringify(options)));
    var paramsData = {
        policy: policy,
        signature: signature
    };
    var urlencParams = formatParams(paramsData);

    var request = new XMLHttpRequest();
    request.open('POST', job.url);
    request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    request.onload = function (e) {
        if (e.target.status == 200) {
            console.log('开始上传文件...');
            var res = JSON.parse(e.target.response);

            e.target.job.save_token = res.save_token;
            e.target.job.token_secret = res.token_secret;
            e.target.job.status = res.status;
            e.target.job.on_token(res);
        } else {
            if (e.target.retry++ < 3) {
                e.target.send(urlencParams);
            } else {
                console.log('获取令牌失败');
            }
        }
    };

    request.job = job;
    request.retry = 1;
    request.send(urlencParams);
}

function calcSign(b, c) {
    if ("object" === typeof b) {
        var d = sortPropertiesByKey(b), a = "", e;
        for (e in d)"signature" !== e && (a = a + e + d[e]);
        return _MD5(a + c)
    }
}

//排序
function sortPropertiesByKey(b) {
    var c = [], d = {}, a;
    for (a in b)b.hasOwnProperty(a) && c.push(a);
    c.sort();
    for (a = 0; a < c.length; a++) {
        var e = c[a];
        d[e] = b[e]
    }
    return d
}

function formatParams(b) {
    var c = [], d;
    for (d in b)c.push(encodeURIComponent(d) + "=" + encodeURIComponent(b[d]));

    return c.join("&")
}

// 图片上传
function upload_part(job, n) {
    if (job.status[n] == 1) {
        setTimeout(function () {
            job.on_part_uploaded({'status': this.status});
        }, 0);
        return;
    }
    var options = {
        'save_token': job.save_token,
        'expiration': job.expiration,
        'block_index': n,
        'block_hash': job.md5s[n]
    };

    var signature = calcSign(options, job.token_secret);
    var policy = btoa(JSON.stringify(options));
    var formDataPart = new FormData();
    formDataPart.append('policy', policy);
    formDataPart.append('signature', signature);
    formDataPart.append('file', job.parts[n]);

    var request = new XMLHttpRequest();
    request.job = job;
    request.onload = function (e) {
        var res = JSON.parse(e.target.response);
        if (e.target.status == 200) {
            var job = e.target.job;
            // TODO 执行图片上传成功回调函数
            //request.job.callback(res);
            setTimeout(function () {
                job.on_part_uploaded(res);
            }, 0);
        }
    };
    request.open('POST', job.url, false);
    request.send(formDataPart);
}

function upload_done(job) {
    var options = {
        'save_token': job.save_token,
        'expiration': job.expiration
    };

    var signature = calcSign(options, job.token_secret);
    var policy = btoa(JSON.stringify(options));
    var formParams = {
        policy: policy,
        signature: signature
    };
    var formParamsUrlenc = formatParams(formParams);
    var request = new XMLHttpRequest();
    request.job = job;
    request.open('POST', job.url);
    request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    request.onload = function (e) {
        var job = e.target.job;
        job.on_done(JSON.parse(e.target.response));
    };
    request.send(formParamsUrlenc);
}