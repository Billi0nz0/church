async function api(url, options = {}) {

    const res = await fetch(url, {
        headers: {
            "Content-Type": "application/json"
        },
        ...options
    });

    if (!res.ok) {
        throw new Error("Request failed");
    }

    return res.json();
}