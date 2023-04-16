import albumentations as A
import albumentations.pytorch
import cv2
import pandas as pd
from sklearn.cluster import KMeans
import numpy as np
import matplotlib.pyplot as plt


def sobel_edge_detection(img):
    a = 0
    b = 1
    c = 2
    f_x = np.array([[-b, -c, -b],[a, a, a],[b, c, b]])
    f_y = np.array([[-b, a, b],[-c, a, c],[-b, a, b]])
    res = cv2.filter2D(img,-1,f_x) + cv2.filter2D(img,-1,f_y)
    return res


def image_processing(img):
    img1 = img.copy()
    image_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    norm_image = cv2.normalize(image_rgb, None, alpha=0, beta=1, norm_type=cv2.NORM_MINMAX, dtype=cv2.CV_32F)
    x, y, w, h = 265, 370, 530, 780
    crop_img = norm_image[y:y + h, x:x + w]

    pic = sobel_edge_detection(crop_img)
    blur_param = (3, 3)
    pic_gauss_blurred = cv2.GaussianBlur(pic, blur_param, cv2.BORDER_DEFAULT)
    the_difference = crop_img - pic_gauss_blurred
    the_difference_blurred = cv2.GaussianBlur(the_difference, blur_param, cv2.BORDER_DEFAULT)

    images = []
    images.append(norm_image)
    images.append(pic_gauss_blurred)
    images.append(the_difference)
    images.append(the_difference_blurred)

    # #######    #########    #########    #########    #########    #########    #########
    # KMeans

    image_rgb = cv2.cvtColor(img1, cv2.COLOR_BGR2RGB)
    norm_image = cv2.normalize(image_rgb, None, alpha=0, beta=100, norm_type=cv2.NORM_MINMAX, dtype=cv2.CV_32F)
    x, y, w, h = 265, 370, 530, 780
    crop_img = norm_image[y:y + h, x:x + w]
    blur_param = (3, 3)

    pic = sobel_edge_detection(crop_img)
    pic_gauss_blurred = cv2.GaussianBlur(pic, blur_param, cv2.BORDER_DEFAULT)
    the_difference = crop_img - pic_gauss_blurred
    the_difference_blurred = cv2.GaussianBlur(the_difference, blur_param, cv2.BORDER_DEFAULT)

    img = the_difference_blurred.reshape((the_difference_blurred.shape[1] * the_difference_blurred.shape[0], 3))

    kmeans = KMeans(n_clusters=4)
    s = kmeans.fit(img)
    labels = kmeans.labels_
    labels = list(labels)

    #     max_labels = []
    #     for _ in range(0, len(labels)):
    #         max_labels.append(np.argmax(labels))

    #     print('labels_of_max_elements', len(labels_of_max_elements))
    centroid = kmeans.cluster_centers_
    percent = []
    for i in range(len(centroid)):
        j = labels.count(i)
        j = j / (len(labels))
        percent.append(j)
    plt.pie(percent, colors=np.array(centroid / 255), labels=np.arange(len(centroid)))
    plt.title('KMeans')
    plt.show()

    titles = []
    titles.append('original_normalized_image')
    titles.append('pic_gauss_blurred')
    titles.append('the_difference')
    titles.append('the_difference_blurred')
    titles.append('KMeans')

    images.append(KMeans)

    # get bigger size images
    fig = plt.gcf()
    fig.set_size_inches(10, 10)
    # plot subplots
    for i in range(0, len(images) - 1):
        plt.subplot(3, 3, i + 1)
        plt.imshow(images[i])
        plt.title(titles[i])

    return the_difference_blurred


path = '/Users/ian/Downloads/dataset/public/frame1254.jpg'
image = cv2.imread(path)
image_processing(image)