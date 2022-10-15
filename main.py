import os
import base64
from io import BytesIO
from PIL import Image

import torch
import torchvision
from torchvision.models.detection.faster_rcnn import FastRCNNPredictor


def get_model_instance_segmentation(num_classes: int):
    # Загрузка предобученной модели детекции
    model = torchvision.models.detection.fasterrcnn_resnet50_fpn(
        pretrained=True)
    # Получение числа входных признаков
    in_features = model.roi_heads.box_predictor.cls_score.in_features
    # Замена последнего слоя под нужное число признаков и классов
    model.roi_heads.box_predictor = FastRCNNPredictor(in_features, num_classes)

    return model


directory = os.getcwd()
num_classes = 2

model = get_model_instance_segmentation(num_classes)
model_path = os.path.join(directory, 'model')

try:
    model.load_state_dict(torch.load(model_path))
    print('Модель успешно загружена')
except:
    pass

model.eval()


def get_bboxes(encoded_data: str) -> dict:
    decoded_data = base64.b64decode(encoded_data)

    img = Image.open(BytesIO(decoded_data))
    img_tensor = torchvision.transforms.ToTensor()(img).unsqueeze(0)

    return model.forward(img_tensor)[0]
