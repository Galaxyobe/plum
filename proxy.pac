var squid_proxy = "PROXY 127.0.0.1:3128; DIRECT";

function FindProxyForURL(url, host) {
    return randomProxy();
}

function randomProxy() {
    switch (Math.floor(Math.random() * 4)) {
        case 0:
            return squid_proxy;
        case 1:
            return "DIRECT";
        case 2:
            return squid_proxy;
        case 3:
            return "DIRECT";
    }
}
