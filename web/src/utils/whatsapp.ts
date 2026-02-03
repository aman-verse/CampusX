export const openWhatsApp = (
    phone: string,
    orderId: number
) => {
    const msg = encodeURIComponent(
        `New order received.\nOrder ID: ${orderId}`
    );

    window.open(
        `https://wa.me/${phone}?text=${msg}`,
        "_blank"
    );
};
