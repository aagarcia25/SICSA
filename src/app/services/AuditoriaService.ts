
import { post } from './apiService';

export class AuditoriaService {

    public static async Auditoriaindex(data : any) {
        return await post('Auditoriaindex', data);
    };

    public static async Notificacionindex(data : any) {
        return await post('Notificacionindex', data);
    };

    public static async Contestacionindex(data : any) {
        return await post('Contestacionindex', data);
    };
    
    public static async Filesindex(data : any) {
        return await post('Filesindex', data);
    };


}
