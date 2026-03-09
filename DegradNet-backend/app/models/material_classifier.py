"""Material classification model using MobileNetV3."""

import torch.nn as nn
from torchvision.models import mobilenet_v3_large


class MaterialClassifier(nn.Module):
    """Classifies input images into material categories (concrete, metal, wood).

    Uses a fine-tuned MobileNetV3-Large backbone with the last 2 feature
    blocks unfrozen for transfer learning.
    """

    def __init__(self, num_classes: int = 3):
        super().__init__()
        self.model = mobilenet_v3_large(weights=None)

        # Freeze all feature extraction layers
        for param in self.model.features.parameters():
            param.requires_grad = False

        # Unfreeze the last 2 blocks for fine-tuning
        for layer in self.model.features[-2:]:
            for param in layer.parameters():
                param.requires_grad = True

        # Replace the final classification head
        self.model.classifier[3] = nn.Linear(
            self.model.classifier[3].in_features,
            num_classes,
        )

    def forward(self, x):
        """Forward pass through the MobileNetV3 backbone."""
        return self.model(x)
