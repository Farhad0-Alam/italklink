


const generateSocialLink = (username) => {
    return {
        link: username,
        phone: `tel:${username}`,
        email: `mailto:${username}`,
        sms: `sms:${username}`,
        whatsapp: `https://wa.me/${username}`,
        skype: `skype:${username}?chat`,
        messenger: `https://m.me/${username}`,
        facebook: `https://www.facebook.com/${username}`,
        instagram: `https://www.instagram.com/${username}`,
        youtube: `https://www.youtube.com/${username}`,
        tiktok: `https://www.tiktok.com/@${username}`,
        pinterest: `https://www.pinterest.com/${username}`,
        location: `https://www.google.com/maps?q=${encodeURIComponent(username)}`
    };
}

export default generateSocialLink