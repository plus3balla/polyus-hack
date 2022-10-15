export const getClassesPercent = (data) => {
    const n_data = data.length;
    let classes = [0, 0, 0, 0, 0, 0, 0];
    for (let i = 0; i < n_data; ++i) {
        let [x1, y1, x2, y2] = data[i];
        const a = Math.max(x2 - x1, y2 - y1);
        if (a <= 40) {
            classes[0]++;
        }
        else if (a <= 70) {
            classes[1]++;
        }
        else if (a <= 80) {
            classes[2]++;
        }
        else if (a <= 100) {
            classes[3]++;
        }
        else if (a <= 150) {
            classes[4]++;
        }
        else if (a <= 250) {
            classes[5]++;
        }
        else {
            classes[6]++;
        }
    }
    // get percents for each class
    for (let i = 0; i < 7; ++i) {
        classes[i] = classes[i] * 100 / n_data;
    }
    return classes;
};
export const getMaxValue = (data) => {
    const n_data = data.length;
    let maxStone = 0;
    for (let i = 0; i < n_data; ++i) {
        let [x1, y1, x2, y2] = data[i];
        const a = Math.max(x2 - x1, y2 - y1);
        if (a > maxStone)
            maxStone = a;
    }
    return maxStone;
};
