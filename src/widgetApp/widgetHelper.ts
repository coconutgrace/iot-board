export default class WidgetHelper {


    static propertyByString(obj: any, path: string) {
        if (!path) {
            return obj;
        }

        path = path.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
        path = path.replace(/^\./, '');           // strip a leading dot
        const tokens = path.split('.');
        for (let i = 0, n = tokens.length; i < n; ++i) {
            let tok = tokens[i];
            if (obj != null && tok in obj) {
                obj = obj[tok];
            } else {
                return;
            }
        }
        return obj;
    }

}
