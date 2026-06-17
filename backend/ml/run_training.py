import pandas as pd
import torch
import torch.nn as nn
import torch.optim as optim

from preprocess import load_dataset, clean_dataset
from feature_engineering import prepare_dataset
from train import IntrusionDetector

print("Loading Dataset...")

df = load_dataset()
df = clean_dataset(df)

print("Preparing Features...")

X, y, encoder = prepare_dataset(df)

X_tensor = torch.tensor(X, dtype=torch.float32)
y_tensor = torch.tensor(y, dtype=torch.long)

input_size = X.shape[1]
num_classes = len(set(y))

model = IntrusionDetector(input_size, num_classes)

criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=0.001)

epochs = 10

print("\nTraining Started...\n")

for epoch in range(epochs):

    optimizer.zero_grad()

    outputs = model(X_tensor)

    loss = criterion(outputs, y_tensor)

    loss.backward()

    optimizer.step()

    print(f"Epoch {epoch+1}/{epochs} Loss: {loss.item():.4f}")

print("\nTraining Completed")

torch.save(model.state_dict(), "backend/ml/intrusion_detector.pth")

print("Model Saved Successfully")