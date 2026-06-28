import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const copyEventLink = async (event: any, shareUrl: string): Promise<boolean> => {
    if (!event) return false;

    const imageUrl = event.image_url || event.additional_image_urls?.[0] || '';
    const dateFormatted = event.date_time ? format(new Date(event.date_time), 'd MMMM yyyy HH:mm', { locale: fr }) : '';

    const htmlContent = `
        <div style="font-family: sans-serif; max-width: 500px;">
            <h3 style="margin-bottom: 8px;">${event.title}</h3>
            ${imageUrl ? `<img src="${imageUrl}" alt="${event.title}" style="max-width: 100%; border-radius: 8px; margin-bottom: 12px;" />` : ''}
            ${dateFormatted ? `<p style="margin: 4px 0;"><strong>Date :</strong> ${dateFormatted}</p>` : ''}
            <p style="margin: 4px 0;"><strong>Lieu :</strong> ${event.location}</p>
            ${event.description ? `<p style="margin: 12px 0; font-size: 14px; color: #4b5563;">${event.description.replace(/\n/g, '<br/>')}</p>` : ''}
            <p style="margin-top: 16px;">
                <a href="${shareUrl}" style="background: #2563eb; color: white; padding: 10px 16px; text-decoration: none; border-radius: 6px; display: inline-block;">
                    Réservez vos places ici !
                </a>
            </p>
        </div>
    `;

    const shareText = `Découvrez cet événement sur Evenia Ticket : \nTitre :${event.title}\nDate: ${dateFormatted ? `${dateFormatted}` : ''}\nLieu :${event.location}\n\nDescription : ${event.description ? event.description + '<br><br>' : ''} \n\nRéservez vos places ici : ${shareUrl}`;

    try {
        if (navigator.clipboard && window.ClipboardItem) {
            const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
            const textBlob = new Blob([shareText], { type: 'text/plain' });

            await navigator.clipboard.write([
                new window.ClipboardItem({
                    'text/html': htmlBlob,
                    'text/plain': textBlob,
                })
            ]);
        } else {
            await navigator.clipboard.writeText(shareText);
        }
        return true;
    } catch (error) {
        console.error('Failed to copy', error);
        try {
            await navigator.clipboard.writeText(shareText);
            return true;
        } catch (err) {
            console.error('Text fallback failed', err);
            return false;
        }
    }
};
